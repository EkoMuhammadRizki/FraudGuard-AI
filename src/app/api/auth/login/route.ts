import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/pustaka/mongodb";

// Akun Seed Default (juri, eko, ihya, ibin, reza)
const SEED_USERS = [
    { username: "juri", email: "juri@amankanfraud.ai", password: "juri123", role: "Juri / Evaluator", name: "Dewan Juri FDS" },
    { username: "eko", email: "eko@amankanfraud.ai", password: "eko123", role: "Lead Developer", name: "Eko Muhammad Rizki" },
    { username: "ihya", email: "ihya@amankanfraud.ai", password: "ihya123", role: "Analyst", name: "Ihya Ulumuddin" },
    { username: "ibin", email: "ibin@amankanfraud.ai", password: "ibin123", role: "Security Specialist", name: "Ibin FDS Intel" },
    { username: "reza", email: "reza@amankanfraud.ai", password: "reza123", role: "ML Engineer", name: "Reza AI Specialist" },
    { username: "admin", email: "admin@amankanfraud.ai", password: "admin1234", role: "Administrator", name: "System Admin" },
];

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
        let dbConnected = false;

        // 1. Coba koneksi dan autentikasi via MongoDB Atlas
        try {
            const { db } = await connectToDatabase();
            dbConnected = true;
            const usersCollection = db.collection("users");

            // Pastikan akun seed (juri, eko, ihya, ibin, reza) tersimpan di database MongoDB jika belum ada
            for (const seedUser of SEED_USERS) {
                const existing = await usersCollection.findOne({
                    $or: [
                        { username: seedUser.username },
                        { email: seedUser.email }
                    ]
                });
                if (!existing) {
                    await usersCollection.insertOne({
                        ...seedUser,
                        createdAt: new Date(),
                    });
                }
            }

            // Cari user berdasar username atau email
            const foundUser = await usersCollection.findOne({
                $or: [
                    { username: inputIdentifier },
                    { email: inputIdentifier }
                ]
            });

            if (foundUser && foundUser.password === inputPassword) {
                authenticatedUser = {
                    username: foundUser.username,
                    email: foundUser.email,
                    name: foundUser.name || foundUser.username,
                    role: foundUser.role || "Analyst",
                };
            }
        } catch (dbErr) {
            console.warn("[API /api/auth/login] MongoDB connection issue, checking fallback seed users...", dbErr);
        }

        // 2. Fallback in-memory jika MongoDB belum merespon atau offline
        if (!authenticatedUser) {
            const fallbackMatch = SEED_USERS.find(
                u => (u.username.toLowerCase() === inputIdentifier || u.email.toLowerCase() === inputIdentifier) && u.password === inputPassword
            );

            if (fallbackMatch) {
                authenticatedUser = {
                    username: fallbackMatch.username,
                    email: fallbackMatch.email,
                    name: fallbackMatch.name,
                    role: fallbackMatch.role,
                };
            }
        }

        if (authenticatedUser) {
            return NextResponse.json({
                status: "success",
                message: `Selamat datang kembali, ${authenticatedUser.name}!`,
                user: authenticatedUser,
                source: dbConnected ? "mongodb_atlas" : "local_seed",
            });
        } else {
            return NextResponse.json(
                {
                    status: "error",
                    message: "Username/Email atau Password salah. Akun default: juri, eko, ihya, ibin, reza (password: juri123, eko123, dst.)",
                },
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
