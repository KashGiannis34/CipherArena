import { authenticate } from '$db/auth/authenticate';
import { Game } from '$db/models/Game';
import { json, redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { generateQuote } from '$db/GenerateQuote';
import { Cookies } from "@sveltejs/kit";
import { UserGame } from '$db/models/UserGame';
import { UserAuth } from '$db/models/UserAuth';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ request, cookies }) {
    try {
        const req = await request.json();

        const auth = authenticate(cookies.get("auth-token"));

        if (!auth) return json({success: false, message: "Unauthorized"});

        const userGame = await UserGame.findById(new ObjectId(auth['id']));
        const userAuth = await UserAuth.findById(new ObjectId(auth['id']));
        if (!userGame || !userAuth) return json({success: false, message: "Unauthorized"});

        if (userGame.currentGame) return json({success: false, message: "You are already in a game. Leave the current game before creating or joining another.", leaveGame: userGame.currentGame?.toString()});

        if (userAuth.verified == false) return json({success: false, message: "Must verify email to create private games."});

        const params = {
            K: req.options.K || '-1',
            Solve: req.options.Solve || 'Decode',
            cipherType: req.cipherType
        };
        const quote = await generateQuote(params);

        const newGame = new Game({
            cipherType: req.cipherType,
            cipherOption: req.cipherOption,
            options: req.options,
            quote: {
                id: quote.id,
                encodedText: quote.quote
            },
            mode: req.mode,
            users: [userGame._id] // Add user references here
        });

        await newGame.save();

        userGame.currentGame = newGame._id;
        await userGame.save();

        return json({
            success: true,
            gameId: newGame._id.toString(),
            message: "Game created successfully"
        });
    } catch (error) {
        return json({success:false, message: (error.message || "Error creating game")});
    }
}