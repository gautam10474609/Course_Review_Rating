const dbConnection = require("./mongoConnection");
const getCollectionFn = collection => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

/* Now, you can list your collections here: */
module.exports = {
  courses: getCollectionFn("courses"),
  students: getCollectionFn("students"),
  reviews: getCollectionFn("reviews"),
  comments: getCollectionFn("comments")
};