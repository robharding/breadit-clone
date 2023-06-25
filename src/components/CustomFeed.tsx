import { INFINITE_SCROLLING_PAGINATION_RESULTS } from '@/config'
import { db } from '@/lib/db'
import PostFeed from './PostFeed'
import { getAuthSession } from '@/lib/auth'

const CustomFeed = async () => {
  const session = await getAuthSession();

  const subscriptions = await db.subscription.findMany({
    where: {
      userId: session?.user.id
    },
    select: {
      subredditId: true
    }
  }).then((subs) => subs.map((sub) => sub.subredditId))

  const posts = await db.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      votes: true,
      author: true,
      comments: true,
      subreddit: true,
    },
    where: {
      subredditId: {
        in: subscriptions
      }
    },
    take: INFINITE_SCROLLING_PAGINATION_RESULTS,
  }) 

  return <PostFeed initialPosts={posts}  />
}

export default CustomFeed