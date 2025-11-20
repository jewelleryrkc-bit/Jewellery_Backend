// import { EntityManager } from "@mikro-orm/core";
import { Resolver, InputType, Arg, Field, Ctx, Mutation, ObjectType, Query, Int } from "type-graphql";
import argon2 from "argon2";
require("dotenv").config();
import { Company, CompanyStatus } from "../entities/Company";
// import Redis from "ioredis";
import { redis } from "../utils/redis";
import nodemailer from "nodemailer";
import { MyContext } from "src/types";
import { COOKIE_NAME } from "../constants";
import { FieldError } from "../../server/src/shared/ferror";
import { User } from "../entities/User";

// const redis = new Redis();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

@InputType()
class UpdateSMTPInput {
  @Field()
  email!: string; // seller’s email used for SMTP

  @Field()
  smtpPassword!: string; // app password
}

@InputType()
class RegisterCompanyInput {
    @Field()
    cname!: string;

    @Field()
    username!: string;
    
    @Field()
    email!: string;
    
    @Field()
    password!: string;

    @Field()
    location!: string;
    
    @Field()
    contact!: number;
}

@InputType()
class UpdateCompanyInput {
    @Field({nullable: true})
    username?:  string;

    @Field({nullable: true})
    email?: string;

    @Field({nullable: true})
    contact?: number;
}

@InputType()
class LoginCompanyInput {
    @Field()
    cname!: string;

    @Field()
    email!: string;
    
    @Field()
    password!: string;
}

@InputType()
class VerifyCompanyInput {
    @Field()
    email!: string;
    
    @Field()
    code!: string;
}

@ObjectType()
class CompanyResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];

    @Field(() => Company, { nullable: true })
    company?: Company;
}

@Resolver()
export class CompanyResolver {

    @Query(() => Company, { nullable: true })
    async me(@Ctx() { req, em }: MyContext) {
        if (!req.session.companyId) {
            return null;
        }
        return await em.findOne(Company, { id: req.session.companyId as string }, { populate: ["products","reviews",'products.variations']});
    }

    @Mutation(() => Company)
        async updateSMTP(
        @Arg("input") input: UpdateSMTPInput,
        @Ctx() { em, req }: MyContext
        ): Promise<Company> {
        if (!req.session.companyId) {
            throw new Error("Not authenticated");
        }

        const company = await em.findOne(Company, { id: req.session.companyId });
        if (!company) {
            throw new Error("Company not found");
        }

        // Ensure seller email matches
        if (company.email !== input.email) {
            throw new Error("Email does not match company account");
        }

        // Save SMTP password (⚠️ should be encrypted in production, not plain)
        company.smtpPassword = input.smtpPassword;
        await em.flush();

        return company;
        }


    @Mutation(() => CompanyResponse)
    async registerCompany(
        @Arg("options") options: RegisterCompanyInput,
        @Ctx() { em }: MyContext
    ): Promise<CompanyResponse> {
        const existingUser = await em.findOne(User, { email: options.email });
        const existingCompany = await em.findOne(Company, { cname: options.cname });
        if (existingCompany) {
            return { errors: [{ field: "cname", message: "Company name already taken" }] };
        }
        if (existingUser) {
            return { errors: [{ field: "email", message: "E-Mail is already registered for buyer account, use new email" }] };
        }
        if (options.password.length < 6) {
            return { errors: [{ field: "password", message: "Password must be at least 6 characters" }] };
        }

        const hashedPassword = await argon2.hash(options.password);
        const company = em.create(Company, {
            cname: options.cname,
            email: options.email,
            password: hashedPassword,
            contact: options.contact,
            location: options.location,
            isEmailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            username: options.username,
            products: "",
            status: CompanyStatus.ACTIVE,
            profileViews: 0
        });
        await em.persistAndFlush(company);

        const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
        // await redis.set(`emailCode:${company.email}`, emailCode, "EX", 600);
        await redis.set(`emailCode:${company.email}`, emailCode, { EX: 600 });

        console.log("Stored Email Code:", await redis.get(`emailCode:${company.email}`));

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: company.email,
            subject: "Verify Your Company Account",
            text: `Your verification code is: ${emailCode}`,
        });

        return { company };
    }

    @Mutation(()=> Company)
    async updateCompanyfields(
        @Arg("companyid") id: string,
        @Arg("input", () => UpdateCompanyInput) input: UpdateCompanyInput,
        @Ctx() { em, req }: MyContext
    ): Promise<Company> {
        if(!req.session.companyId) {
            throw new Error("Not authenticated");
        }
        const company = await em.findOne(Company, { id });
        if (!company) {
            throw new Error("Company not found");
        }
        em.assign(company, input);
        await em.flush()

        return company;
    }

    @Mutation(()=> Company)

    async deleteCompany(
        @Arg("id") id: string,
        @Ctx() { em }: MyContext
    ): Promise<Company> {
        const company =await em.findOne(Company, { id } );
        if (!company) throw new Error("Company not found");

        await em.removeAndFlush(company);
        return company;
    }

    @Mutation(() => CompanyResponse)
    async verifyCompany(
        @Arg("input") input: VerifyCompanyInput,
        @Ctx() { em }: MyContext
    ): Promise<CompanyResponse> {
        const company = await em.findOne(Company, { email: input.email });

        if (!company) {
            return { errors: [{ field: "email", message: "Company not found" }] };
        }

        const storedEmailCode = await redis.get(`emailCode:${input.email}`);

        if (!storedEmailCode || input.code !== storedEmailCode) {
            return { errors: [{ field:
                 "code", message: "Invalid or expired verification code" }] };
        }

        company.isEmailVerified = true;
        await em.persistAndFlush(company);

        await redis.del(`emailCode:${input.email}`);

        return { company };
    }

    @Mutation(() => CompanyResponse)
    async loginCompany(
        @Arg("options") options: LoginCompanyInput,
        @Ctx() { em, req }: MyContext
    ): Promise<CompanyResponse> {
        const company = await em.findOne(Company,{cname: options.cname})

        const email = await em.findOne(Company,{email: options.email});

        const cname = await em.findOne(Company,{cname: options.cname});

        if (!company) {
            return { errors: [{ field: "cname", message: "Company not found" }] };
        }

        if (!cname) {
            return { errors: [{ field: "cname", message: "Invalid name" }] };
        }

        if (!email) {
            return { errors: [{ field: "email", message: "Invalid Email" }] };
        }

        if (!company.isEmailVerified) {
            return { errors: [{ field: "verification", message: "Company email not verified" }] };
        }

        const valid = await argon2.verify(company.password, options.password);
        if (!valid) {
            return { errors: [{ field: "password", message: "Incorrect password" }] };
        }

        req.session.companyId = company.id;
        return { company };
    }

    @Mutation(() => Boolean)
    logoutCompany(@Ctx() { req, res }: MyContext) {
        if (!req.session.companyId) {
            return false;
        }
        return new Promise((resolve) =>
            req.session.destroy((err) => {
                res.clearCookie(COOKIE_NAME);
                if (err) {
                    console.log(err);
                    resolve(false);
                    return;
                }
                resolve(true);
            })
        );
    }

    @Query(() => [Company])
    async getCompanies(@Ctx() { em }: MyContext): Promise<Company[]> {
        return em.find(Company, {}, {populate: ['products','reviews']});
    }

    @Query(() => Company)
    async getCompany(
        @Arg("id") id: string,
        @Ctx() { em }: 
        MyContext): Promise<Company> {
        const company = await em.findOne(Company, { id }, {populate: ['products', 'products.reviews','reviews', 'reviews.user']});
        if(!company) {
            throw new Error("Company not found");
        };
        
        return company
    }

    // Add to your CompanyResolver.ts
        @Mutation(() => Boolean)
        async trackCompanyView(
        @Arg("companyId") companyId: string,
        @Ctx() { em, req }: MyContext
        ): Promise<boolean> {
        try {
            const company = await em.findOne(Company, { id: companyId });
            if (!company) {
            throw new Error("Company not found");
            }

            // Increment view count
            company.profileViews = (company.profileViews || 0) + 1;
            company.lastViewedAt = new Date();

            // Store recent viewer (optional)
            if (req.session.userId) {
            if (!company.recentViewerIds) {
                company.recentViewerIds = [];
            }
            // Add user ID to recent viewers (limit to last 10)
            company.recentViewerIds = [
                req.session.userId,
                ...(company.recentViewerIds || []).filter(id => id !== req.session.userId)
            ].slice(0, 10);
            }

            await em.persistAndFlush(company);
            return true;
        } catch (error) {
            console.error("Error tracking company view:", error);
            return false;
        }
    }

        @Query(() => Int)
         async getCompanyProfileViews(
            @Arg("companyId") companyId: string,
            @Ctx() { em, req }: MyContext
            ): Promise<number> {
            // Only company owners can view their stats
            const company = await em.findOne(Company, { id: companyId });
            if (!company) {
                throw new Error("Company not found");
            }

            if (req.session.companyId !== companyId) {
                throw new Error("Unauthorized: Only company owner can view stats");
            }

            return company.profileViews || 0;
        }

    @Query(() => [User], { nullable: true })
      async getRecentCompanyViewers(
        @Arg("companyId") companyId: string,
        @Ctx() { em, req }: MyContext
         ): Promise<User[] | null> {
        const company = await em.findOne(Company, { id: companyId }, { populate: ['recentViewerIds'] });
        if (!company) {
            throw new Error("Company not found");
        }

        if (req.session.companyId !== companyId) {
            throw new Error("Unauthorized: Only company owner can view visitors");
        }

        if (!company.recentViewerIds || company.recentViewerIds.length === 0) {
            return null;
        }

        // Fetch user details for recent viewers
        const users = await em.find(User, { 
            id: { $in: company.recentViewerIds } 
        });

        return users;
        }
}
