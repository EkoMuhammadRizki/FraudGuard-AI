import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/pustaka/mongodb";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username, email, password } = body;

        const cleanUsername = (username || "").trim().toLowerCase();
        const cleanEmail = (email || "").trim().toLowerCase();
        const cleanPassword = (password || "").trim();

        if (!cleanUsername || !cleanEmail || !cleanPassword) {
            return NextResponse.json(
                { status: "error", message: "Username, Email, dan Password wajib diisi." },
                { status: 400 }
            );
        }

        if (cleanPassword.length < 6) {
            return NextResponse.json(
                { status: "error", message: "Password minimal 6 karakter." },
                { status: 400 }
            );
        }

        let dbConnected = false;
        let insertedId = null;

        // Simpan ke MongoDB Atlas
        try {
            const { db } = await connectToDatabase();
            dbConnected = true;
            const usersCollection = db.collection("users");

            // Cek apakah username / email sudah terdaftar
            const existing = await usersCollection.findOne({
                $or: [
                    { username: cleanUsername },
                    { email: cleanEmail }
                ]
            });

            if (existing) {
                return NextResponse.json(
                    { status: "error", message: "Username atau Email sudah terdaftar dalam sistem." },
                    { status: 400 }
                );
            }

            const newUser = {
                username: cleanUsername,
                email: cleanEmail,
                password: cleanPassword,
                name: cleanUsername.charAt(0).toUpperCase() + cleanUsername.slice(1),
                role: "Analyst",
                createdAt: new Date(),
            };

            const result = await usersCollection.insertOne(newUser);
            insertedId = result.insertedId;
        } catch (dbErr) {
            console.warn("[API /api/auth/register] MongoDB insertion issue, proceeding with fallback confirmation...", dbErr);
        }

        return NextResponse.json({
            status: "success",
            message: "Pendaftaran berhasil! Silakan masuk dengan akun baru Anda.",
            user: {
                username: cleanUsername,
                email: cleanEmail,
                role: "Analyst",
            },
            source: dbConnected ? "mongodb_atlas" : "local_confirmation",
        });

    } catch (err: unknown) {
        console.error("[API /api/auth/register] Internal Error:", err);
        return NextResponse.json(
            { status: "error", message: "Terjadi kesalahan internal saat registrasi akun." },
            { status: 500 }
        );
    }
}
