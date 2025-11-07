// @Query(() => Product, { nullable: true })
//       async productBySlug(
//         @Arg("slug") slug: string, 
//         @Ctx() { em }: MyContext
//       ): Promise<Product | null> {
//         console.log(`🔍 [RESOLVER] ProductBySlug called with slug: ${slug}`);
        
//         // TEMPORARY: Add a bypass flag to test without caching
//         // const BYPASS_CACHE = process.env.BYPASS_CACHE === 'true';
        
//         // if (BYPASS_CACHE) {
//         //   console.log(`⚠️ [RESOLVER] Cache bypassed for slug: ${slug}`);
//         //   const product = await em.findOne(
//         //     Product,
//         //     { slug, status: ProductStatus.ACTIVE },
//         //     { populate: ["variations", "category", 'reviews.user', 'company.cname'] }
//         //   );
//         //   console.log(`📊 [RESOLVER] Direct DB result for ${slug}:`, product ? `Found ID=${product.id}` : 'Not found');
//         //   return product;
//         // }
        
//         // Test with minimal cache
//         return getOrSetCache(`product:slug:${slug}`, async () => {
//           console.log(`📦 [RESOLVER] Fetching product from DB for slug: ${slug}`);
          
//           const product = await em.findOne(
//             Product,
//             { slug, status: ProductStatus.ACTIVE },
//             // { populate: ["variations", "category",'company.cname'] }
//             { populate: ['variations', 'category', 'company.cname', 'reviews.user']}
//           );
      
//           if (!product) {
//             console.log(`❌ [RESOLVER] Product not found for slug: ${slug}`);
//             return null;
//           }
      
//           console.log(`✅ [RESOLVER] Product found for slug: ${slug}, ID: ${product.id}`);
//           // return wrap('').toJSON();
//           return product;
//         }, 300);
//       }