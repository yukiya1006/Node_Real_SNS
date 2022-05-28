const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');

//投稿を作成
router.post("/", async (req, res) =>{
  const newPost = new Post(req.body);
  try {
    const savePost = await newPost.save();
    return res.status(200).json(savePost);

  } catch (err) {
    return res.status(500).json(err);
  }
});

//投稿を編集
router.put("/:id", async (req, res) =>{
  const patchPost = new Post(req.body);
  try {
    const post = await Post.finsById(req.params.id); //postの情報を探す
    if(post.userId === req.user.id) {
      await post.updateOne({
        $set: req.body,
      });
      return res.status(200).json("投稿を編集しました")
    } else {
      return res.status(403).json("他人の投稿は編集できません");
    }
  } catch (err) {
    return res.status(403).json(err);
  }
});

//投稿を削除
router.delete("/:id", async (req, res) => {
  try {
    //投稿したidを取得
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("投稿を削除しました");
    } else {
      res.status(403).json("他人の投稿は削除できません");
    }
  } catch (err) {
    res.status(403).json(err);
  }
});

//特定の投稿を取得
router.get("/:id", async (req, res) => {
  try {
    //投稿したidを取得
    const post = await Post.findById(req.params.id);
    return res.status(200).json(post);
  } catch (err) {
    res.status(403).json(err);
  }
});

// 特定の投稿にいいねを押す
router.put('/:id/like', async (req, res) => {
    try {
      const post = await Post.findById( req.params.id ); //対象のid
      //フォローしているのか判定
      //まだ投稿にいいねが押さされてなかったら
      if (!post.likes.includes(req.body.userId)) { 
        await post.updateOne({
          $push: {
            likes: req.body.userId, //  対象のfolloersに自分のidを入れる
          },
        });
        return res.status(200).json('いいねしました');
        //既に投稿にいいねされていたら
      } else {
        //いいねしているユーザーIDを取り除く
        await post.updateOne({
          likes: req.body.userId,
        });
        return res.status(403).json('いいねを解除しました');
      }
    } catch (err) {
      return res.status(500).json(err);
    }
});

//タイムラインの投稿を取得
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;
