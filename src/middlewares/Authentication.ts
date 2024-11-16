import type { Context, Next } from "hono";
import jwt from "jsonwebtoken";

export const authenticate = async (c: Context, next: Next) => {
    let token = c.req.header("authorization");
    if (token === undefined) {
        c.status(400);
        return c.json({
            message: "no access token was provided."
        })
    }

    token = token.includes("Bearer ") ? token.split(" ")[1]! : token;
    const { JWT_SECRET } = process.env;
    try {
        jwt.verify(token, JWT_SECRET!);
        return await next();
    }
    catch {
        c.status(400);
        return c.json({ message: "Invalid token." });
    }

}