import TwitterAPI, { ETwitterStreamEvent } from "twitter-api-v2";
import * as dotenv from "dotenv";

dotenv.config();

const main = async () => {

  const client = new TwitterAPI({
    appKey: process.env.TWITTER_APP_KEY,
    appSecret: process.env.TWITTER_APP_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_ACCESS_SECRET,
  });

  // 自身のtwitteridを取得
  const meUser = await client.v2.me();

  // 直近70件のtweetを取得
  const tweetsOfMe = await client.v2.userTimeline(
    meUser.data.id,
    {
      exclude: 'replies',
      max_results: 70,
    }
  );

  // tweetIdからtweetに対するいいねを繰り返し処理で取得し全て配列に入れる
  const result = await Promise.all(tweetsOfMe.data.data.map(async (data, i) => {
    const usersPaginated = await client.v2.tweetLikedBy(
      data.id,
      { asPaginator: true }
    );
    if (usersPaginated.data.meta.result_count == 0) return
    return usersPaginated.data.data.map((likes, i) => {
      return likes.id
    })
  }));

  let concatResult = []
  for (let i = 0; i < result.length; i ++) {
    concatResult = concatResult.concat(result[i])
  }

  // 配列の中でIdに被りがあるものをカウント
  let count = {};
  for (var i = 0; i < concatResult.length; i++) {
    var elm = concatResult[i];
    if (elm == null) continue;

    count[elm] = (count[elm] || 0) + 1;
  }

  // ソート
  const countArray = Object.entries(count).map(([id, likes]) => ({id, likes}))
  countArray.sort(function(a, b) {
    if (a.likes < b.likes) {
      return 1;
    } else {
      return -1;
    }
  })

  console.log(countArray);

};

main();