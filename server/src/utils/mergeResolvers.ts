/**
 * Merges multiple resolver objects into a single resolver object
 * This is useful for combining resolvers from different modules
 *
 * @param resolversArray Array of resolver objects
 * @returns Merged resolver object
 */
export const mergeResolvers = (resolversArray: any[]): object => {
  const merged = {};

  // Process each resolver object
  resolversArray.forEach((resolverObj) => {
    // For each top-level key (Query, Mutation, etc.)
    Object.keys(resolverObj).forEach((key) => {
      if (!merged[key]) {
        merged[key] = {};
      }

      // For each resolver function in this category
      Object.keys(resolverObj[key]).forEach((field) => {
        merged[key][field] = resolverObj[key][field];
      });
    });
  });

  return merged;
};
