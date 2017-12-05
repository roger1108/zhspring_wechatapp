// pages/Message/Message.js
Page({
  data:{
    info:{},
    title:"",
    content:""
    },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
   formSubmit: function(e) {
    this.setData({info:e.detail.value});
    
         var self=this;
      if(this.data.info.title==""){
        wx.showModal({
          title:"提示",
          content:"留言的标题不能为空",
          showCancel:false
        })
      }else{
        if(this.data.info.content==""){
              wx.showModal({
             title:"提示",
          content:"留言的内容不能为空",
          showCancel:false
        })
        }
        else{
          var app = getApp();
var rand=require('../../utils/random.js');
var sign=require('../../utils/sign.js');
 
   var sessionKey=wx.getStorageSync('sessionKey');
     var appId=app.globalData.appId;//appid;
      var nonce_str=rand.getRand();//获取随机数
      var ctgId=self.data.info.ctgId;
      var title=self.data.info.title;
      var content=self.data.info.content;
       var postParams=[];//签名数组
        postParams[0]=["ctgId",ctgId];
        postParams[1]=["appId",appId];
        postParams[2]=["nonce_str",nonce_str];
        postParams[3]=["sessionKey",sessionKey];
        postParams[4]=["title",title];
        postParams[5]=["content",content];
        var signVal=sign.createSign(postParams,app.globalData.appKey);//签名
           wx.request({
             url: app.globalData.url+'/guestbook/save.jspx',
             data: {
                ctgId:ctgId,
                title:title,
                content:content,
                nonce_str:nonce_str,
                sessionKey:sessionKey,
                sign:signVal,
                appId:appId
             },
                  header: {
                          'content-type':      'application/x-www-form-urlencoded'
                      },
                      method:"POST",
             success: function(res){
               if(res.data.status=="true"){
                  wx.showToast({
                    title:"留言成功！",
                    icon:"success",
                    duration:5000
                  });
                  setTimeout(function(){
                   wx.hideToast();
                    self.setData({title:"",content:""})
                  },1000)
               }
             }
           })
        }
      }
    
    
    
      },
  save:function(){
   
   


  }   
})