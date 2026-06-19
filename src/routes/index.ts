import { Router } from "express";
import { register, login } from "../controllers/auth.controller";

import {
	getAllProducts,
	getProductBySlug,
	createProduct,
	updateProduct,
	deleteProduct,
	getAllCategories,
	createCategory,
} from "../controllers/product.controller";
import {
	getCart,
	addToCart,
	updateCartItem,
	removeFromCart,
	clearCart,
} from "../controllers/cart.controller";
import {
	createOrder,
	getMyOrders,
	getOrderById,
	getAllOrders,
	updateOrderStatus,
} from "../controllers/order.controller";
import { authenticate } from "../middleware/auth";
import { isAdmin } from "../middleware/admin";

const router = Router();

// public routes
router.post("/register", register);
router.post("/login", login);

// Public product routes
router.get("/products", getAllProducts);
router.get("/products/:slug", getProductBySlug);
router.get("/categories", getAllCategories);

// Admin product & category routes
router.post("/admin/products", authenticate, isAdmin, createProduct);
router.put("/admin/products/:id", authenticate, isAdmin, updateProduct);
router.delete("/admin/products/:id", authenticate, isAdmin, deleteProduct);
router.post("/admin/categories", authenticate, isAdmin, createCategory);

// Cart section
router.get("/cart", authenticate, getCart);
router.post("/cart/items", authenticate, addToCart);
router.put("/cart/items/:itemId", authenticate, updateCartItem);
router.delete("/cart/items/:itemId", authenticate, removeFromCart);
router.delete("/cart", authenticate, clearCart);

router.post("/orders", authenticate, createOrder);
router.get("/orders", authenticate, getMyOrders);
router.get("/orders/:id", authenticate, getOrderById);
router.get("/admin/orders", authenticate, isAdmin, getAllOrders);
router.put(
	"/admin/orders/:id/status",
	authenticate,
	isAdmin,
	updateOrderStatus,
);

export default router;
