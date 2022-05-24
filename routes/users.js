const router = require('express').Router();
const User = require('../models/User');

//CRUD
//ユーザー情報の取得
router.get('/:id', async(req, res) => {
    try {
      const user = await User.findById(req.params.id);
      const { password, updatedAt, ...other } = user._doc;
      res.status(200).json(other);
    } catch(err) {
      return res.status(500).json(err);
    }
    return res.status(403).json('ユーザー情報が違うため更新が出来ません');
});

//ユーザー情報の更新
router.put('/:id', async(req, res) => {
  if(req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json('ユーザー情報が更新されました');
    } catch(err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json('ユーザー情報が違うため更新が出来ません');
  }
});

//ユーザー情報の削除
router.delete('/:id', async(req, res) => {
  if(req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json('ユーザー情報が削除されました');
    } catch(err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json('ユーザー情報が違うため削除出来ません');
  }
});

//ユーザーのフォロー
router.put('/:id/follow', async (req, res) => {
  if(req.body.userId !== req.params.id ) { //自分のidと対象のidが等しくない場合
    try {
      const user = await User.findById(req.params.id); //対象のid
      const currentUser = await User.findById(req.body.userId); //自分のid
      //フォローしているのか判定
      //対象のフォロワーに自分が含まれていなければtrue
      if (!user.followers.includes(req.body.userId)) { 
        await user.updateOne({
          $push: {
            followers: req.body.userId, //  対象のfolloersに自分のidを入れる
          },
        });
        await currentUser.updateOne ({
          $push: {
            followings: req.params.id, // 自分のfollowingに相手のidを入れる
          },
        })
        return res.status(200).json('フォローしました');
      } else {
        return res.status(403).json('フォロー済です');
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(500).json('自分のアカウントはフォローできません');
  }
});


// router.get('/', (req, res) => {
//   res.send('user router');
// });

module.exports = router;
