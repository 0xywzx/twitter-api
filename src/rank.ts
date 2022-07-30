import TwitterAPI, { ETwitterStreamEvent } from "twitter-api-v2";
import * as dotenv from "dotenv";

dotenv.config();

const client = new TwitterAPI({
  appKey: process.env.TWITTER_APP_KEY,
  appSecret: process.env.TWITTER_APP_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const main = async () => {

  const startDate = new Date('29 July 2022 23:28:00')
  const searchText = 'イ反社にカツ！'

  // // 自身のtwitteridを取得
  const tweets = await client.v2.search(
    'イ反社にカツ！',
    {
      start_time: startDate.toISOString(),
      'tweet.fields': ['author_id', 'created_at'],
    }
  );

  // 順番の入れ替え
  tweets.data.data.sort(function(a, b) {
    if (a.created_at > b.created_at) {
      return 1;
    } else {
      return -1;
    }
  })

  // 該当のtweet飲み取得
  const targetTweet = await Promise.all(
    tweets.data.data.map(async (data, i) => {
      const text = data.text
      if (text == searchText || text == 'イ反社にカツ!') {
        return {
          user : await userName(data.author_id),
          time: time(data.id)
        }
      }
    })
  )

  console.log(targetTweet.filter(v => v))

};

const userName = async (id: string) => {
  const user = await client.v2.user(
    id,
    {
      'user.fields': 'name'
    }
  );
  return user.data.name
}

const time = (id: string) => {
  const unixTime = (parseInt(id, 10) / Math.pow(2, 22)) + 1288834974657;
  const timeDiff = 9 * 60 * 60 * 1000 // 9時間
  const tweetDate = new Date(unixTime + timeDiff);
  return tweetDate
}

main();