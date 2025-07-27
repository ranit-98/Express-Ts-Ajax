/**
 * Express application configuration
 * Sets up middleware, routes, and error handling
 */
import express from "express";
import path from "path";
import session from "express-session";
import cookieParser from "cookie-parser";
import { corsMiddleware } from "./shared/middleware/cors.middleware";
import { errorMiddleware } from "./shared/middleware/error.middleware";
import { logger } from "./shared/utils/logger";

// Route imports
import authRoutes from "./modules/auth/routes/auth.routes";
import productRoutes from "./modules/product/routes/product.routes";
import adminRoutes from "./modules/admin/routes/admin.routes";

const app = express();

// =======================> View Engine Setup <=======================
app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "views"),
  path.join(__dirname, "modules", "auth", "views"),
  path.join(__dirname, "modules", "admin", "views"),
]);
app.set('view cache', false);


// =======================> Middleware Setup <=======================
app.use(corsMiddleware);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// =======================> Routes Setup <=======================
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/admin', adminRoutes);

// try {
//   app.use("/auth", authRoutes);
// } catch (err) {
//   console.error("Error loading /auth routes:", err);
// }

// try {
//   app.use("/products", productRoutes);
// } catch (err) {
//   console.error("Error loading /products routes:", err);
// }

// try {
//   app.use("/admin", adminRoutes);
// } catch (err) {
//   console.error("Error loading /admin routes:", err);
// }

// Home route
app.get("/", (req, res) => {
  res.render("layouts/main", {
    title: "Home",
    body: "../partials/home",
    user: req.session.user || null,
  });
});

// =======================> Error Handling <=======================
// app.use(errorMiddleware);

// 404 handler
// app.use('*', (req, res) => {
//   res.status(404).render('layouts/main', {
//     title: 'Page Not Found',
//     body: '../partials/404',
//     user: req.session.user || null
//   });
// });

export default app;
