const express = require("express");
const { getAllProducts, createProduct, updateProduct, deleteProduct, getProductDetails, createOrUpdateReview, getProductReviews, deleteProductReview } = require("../controllers/productController");
const { isAuthenticatedUser,authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route('/products').get(getAllProducts);
router.route('/products/new').post(isAuthenticatedUser,authorizeRoles("admin"), createProduct);
router.route('/products/:id').put(isAuthenticatedUser,authorizeRoles("admin"),updateProduct)
.delete(isAuthenticatedUser,authorizeRoles("admin"),deleteProduct);
router.route('/products/:id').get(getProductDetails);
router.route('/review').put(isAuthenticatedUser,createOrUpdateReview);
router.route('/reviews').get(getProductReviews).delete(isAuthenticatedUser,deleteProductReview);



module.exports = router