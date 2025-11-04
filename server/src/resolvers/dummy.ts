import { Resolver, Query, Ctx } from "type-graphql";
import { Dummy } from "../entities/Dummy";
import { MyContext } from "../types";

@Resolver()
export class DummyResolver {
    @Query(()=> [Dummy])
    posts(@Ctx() { em }: MyContext ): Promise<Dummy[]>{
        return em.find(Dummy, {});
    }
}