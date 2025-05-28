import { authenticate } from '$db/auth/authenticate';
import { Game } from '$db/models/Game';
import { json, redirect } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import { generateQuote } from '$db/GenerateQuote';
import { Cookies } from "@sveltejs/kit";
import { UserGame } from '$db/models/UserGame';
import { UserAuth } from '$db/models/UserAuth';
import { generateShortCode } from '$db/generateShortCode';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function POST({ request, cookies }) {
    try {
        const req = await request.json();
        console.log(req);

        const auth = authenticate(cookies.get("auth-token"));

        if (!auth) return json({success: false, message: "Unauthorized"});

        const userGame = await UserGame.findById(new ObjectId(auth['id']));
        const userAuth = await UserAuth.findById(new ObjectId(auth['id']));
        if (!userGame || !userAuth) return json({success: false, message: "Unauthorized"});

        if (userGame.currentGame) return json({success: false, message: "You are already in a game. Leave the current game before creating or joining another.", leaveGame: userGame.currentGame});

        if (userAuth.verified == false) return json({success: false, message: "Must verify email to create games."});

        const params = {
            K: req.cipherOptionObj.K || '-1',
            Solve: req.cipherOptionObj.Solve || 'Decode',
            cipherType: req.cipherType
        };

        // Validate playerLimit
        const playerLimit = Number(req.options.playerLimit);
        if (isNaN(playerLimit) || playerLimit < 2 || playerLimit > 6) {
            return json({success: false, message: "Invalid player limit. Must be between 2 and 6."});
        }

        const quote = await generateQuote(params);

        let shortCode;
        let isTaken = true;

        // Retry until a unique shortCode is found
        while (isTaken) {
            shortCode = generateShortCode();
            isTaken = await Game.exists({ shortCode });
        }

        const newGame = new Game({
            _id: shortCode,
            params: params,
            autoFocus: req.options.AutoFocus,
            playerLimit: playerLimit,
            quote: {
                id: quote.id,
                encodedText: quote.quote,
                keys: quote.keys
            },
            mode: req.mode,
            users: [userGame._id],
            host: userGame._id
        });

        await newGame.save();

        userGame.currentGame = newGame._id;
        await userGame.save();

        return json({
            success: true,
            gameId: newGame._id,
            message: "Game created successfully"
        });
    } catch (error) {
        return json({success:false, message: (error.message || "Error creating game")});
    }
}