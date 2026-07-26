import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/pustaka/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username, password } = body;

        const inputIdentifier = (username || body.email || "").trim().toLowerCase();
        const inputPassword = (password || "").trim();

        if (!inputIdentifier || !inputPassword) {
            return NextResponse.json(
                { status: "error", message: "Username/Email dan Password wajib diisi." },
                { status: 400 }
            );
        }

        let authenticatedUser = null;

        try {
            const { db } = await connectToDatabase();
            const usersCollection = db.collection("users");

            const foundUser = await usersCollection.findOne({
                $or: [
                    { username: inputIdentifier },
                    { email: inputIdentifier }
                ]
            });

            if (foundUser) {
                const passwordMatch = await bcrypt.compare(inputPassword, foundUser.password);
                if (passwordMatch) {
                    authenticatedUser = {
                        username: foundUser.username,
                        email: foundUser.email,
                        name: foundUser.name || foundUser.username,
                        role: foundUser.role || "Analyst",
                    };
                }
            }
        } catch (dbErr) {
            console.warn("[API /api/auth/login] MongoDB connection issue:", dbErr);
        }

        if (authenticatedUser) {
            return NextResponse.json({
                status: "success",
                message: `Selamat datang kembali, ${authenticatedUser.name}!`,
                user: authenticatedUser,
            });
        } else {
            return NextResponse.json(
                { status: "error", message: "Username/Email atau Password salah." },
                { status: 401 }
            );
        }

    } catch (err: unknown) {
        console.error("[API /api/auth/login] Internal error:", err);
        return NextResponse.json(
            { status: "error", message: "Terjadi kesalahan server saat autentikasi." },
            { status: 500 }
        );
    }
}
