// if (process.env.NODE_ENV === "development") {
//     require('dotenv').config()
// }
const { ClientCredentialsAuthProvider  } = require('@twurple/auth')
const { ApiClient } = require('@twurple/api')
// const { youtube } = require('@googleapis/youtube')

const TWITCH = 1
const YOUTUBE = 3

const QT = 3

const authProvider = new ClientCredentialsAuthProvider(process.env.TWITCH_KEY, process.env.TWITCH_SECRET)
const twitchClient = new ApiClient({ authProvider })

// const ytClient = youtube({
//     version: "v3",
//     auth: process.env.YOUTUBE_KEY, // https://cloud.google.com/docs/authentication/api-keys?hl=en&visit_id=637865110997856066-2204694991&rd=1#creating_an_api_key
// });

const Knex = require('knex');
const knex = Knex({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME || 'postgres',
    },
    // pool: {
    //     min: 10,
    //     max: Number(process.env.DB_POOL_MAX) || 20,
    //     createTimeoutMillis: 30 * 1000,
    //     acquireTimeoutMillis: 15 * 1000,
    // },
});

exports.handler = async (event) => {
    // const knex = require('db')
    await refreshClips(QT, TWITCH);
    // refreshClips(QT, YOUTUBE);

    

}

async function refreshClips(game_id, content_type) {
    // const fourMinutesAgo = new Date(Date.now() - 10000);
    const oldClips = await knex
        .select(["postId", "url"])
        .from("clips")
        .where("content_type", content_type)
        .andWhere("game_id", game_id)
        .limit(100)
        
        // .andWhere("updated_at", "<", fourMinutesAgo);

    console.log('oldclips length: ' + oldClips.length);

    var refreshedClips = []
    if (content_type === TWITCH) {
        refreshedClips = await refreshTwitchClips(oldClips);
    } else if (content_type === YOUTUBE) {
        refreshedClips = await refreshYoutubeClips(oldClips);
    }

    // {
    //     postId: number,
    //     view_count: number,
    //     title: string
    // }
    if (refreshedClips.length > 0) {
        console.log("oop: " + refreshedClips.length);
        await knex("clips")
            .insert(refreshedClips)
            .onConflict("postId")
            .merge([
                "view_count",
                "title"
            ]);
    }
}

async function refreshTwitchClips(oldClips) {
    const oldClipsTwitchIds = oldClips.map(
        ({ postId, url }) => {
            const matches = url.match(/^.*(?:clips.twitch.tv|twitch.tv\/.*\/clip)\/([^\?]*)(?:\?.*)?$/)

            if (matches) {
                return {
                    postId: postId,
                    external_id: matches[1]
                }
            } else {
                return {
                    postId: postId,
                    external_id: ""
                }
            }
        } 
    )

    const clipsResponse = await twitchClient.clips.getClipsByIds(
        oldClipsTwitchIds.map(({ external_id }) => external_id)
    );

    if (clipsResponse.length === 0) {
        return [];
    }
    
    const refreshedClips = []
    for (const oldClip of oldClipsTwitchIds) {
        const clip = clipsResponse.find((clip) => {
            return clip.id === oldClip.external_id;
        });

        // deleted
        if (clip === undefined) {
            console.log("hiding clip: " + oldClip.postId);
            await knex("clips").where("postId", oldClip.postId).update({
                hidden: true,
            });
            continue;
        }

        // const { numVotes, isHidden } = await updateClipIsHidden(dbClip.id);
        // if (isHidden) {
        //     continue;
        // }
        // const score = await calculateClipScore(dbClip.id, numVotes);

        refreshedClips.push({
            postId: oldClip.postId,
            view_count: clip.views,
            title: clip.title
            // score: score,
            // updated_at: currentTime,
            // external_parent_video_id: clip.videoId
        });
    }

    // console.log("refreshed!: " + JSON.stringify(refreshedClips));

    return refreshedClips;
}

async function refreshYoutubeClips(oldClips) {
    // maybe not needed? am I even using the clipId
    // const oldClipsExtIds = oldClips.map(
    //     ({ postId, url }) => {
    //         const matches = url.match(/^.*(youtube.com\/clip\/)([^#\&\?]*).*/)

    //         if (matches) {
    //             return {
    //                 postId: postId,
    //                 external_id: matches[1]
    //             }
    //         } else {
    //             return {
    //                 postId: postId,
    //                 external_id: ""
    //             }
    //         }
    //     } 
    // )

    // for (const oldClip of oldClips) {
        
    // }

    // console.log("lol: " + JSON.stringify(oldClipsExtIds.map(({ external_id }) => external_id)))

    return [];
}