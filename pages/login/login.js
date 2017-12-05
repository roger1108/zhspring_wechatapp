// pages/login/login.js
var app = getApp();
var en=require('../../utils/aes.js');
var rand=require('../../utils/random.js');
var sign=require('../../utils/sign.js');
Page({
  data:{
      flag:"1",
       userName:"",
       userPwd:"",
       toast:""
   
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
  },
  reg:function(){
    wx.redirectTo({
      url: '../register/register'
    })
  },
  clear:function(){//清除
        this.setData({userName:"",flag:"1"});
  },
  savePwd:function(){
    console.log("记住密码");
    var aesPassword = en.encrypt(this.data.userPwd,      app.globalData.aesKey,app.globalData.ivKey);//aes密码
    wx.setStorageSync('userLoginInfo', {'userName':this.data.userName,
    'userPwd':aesPassword});
  },
  getUserName:function(e){
   this.setData({flag:"",
   userName:e.detail.value
   });
  var localName=wx.getStorageSync('userLoginInfo');
  var localPwd=en.decrypt(localName.userPwd,app.globalData.aesKey,app.globalData.ivKey)
  if(localName!=""&&localName.userName==e.detail.value){
    this.setData({userPwd:localPwd})
  }
  },
  getUserPwd:function(e){
    this.setData({userPwd:e.detail.value});
  },

   getInfo:function(){
     var https=0;
      var username=wx.getStorageSync('userName');//用户名
      var appId=app.globalData.appId;//appid;
      var nonce_str=rand.getRand();//获取随机数
       var postParams=[];//签名数组
        postParams[0]=["username",username];
        postParams[1]=["appId",appId];
        postParams[2]=["nonce_str",nonce_str];
        postParams[3]=["https",https];
        var signVal=sign.createSign(postParams,app.globalData.appKey);//签名
      var getUser_url= app.globalData.url+"/user/get.jspx?username="+username+"&appId="+appId+"&nonce_str="+nonce_str+"&sign="+signVal+"&https=0";
       //获取信息
       var self=this;
       wx.request({
         url: getUser_url,
         data: {},
         method: 'POST', 
         success: function(res){
           console.log(res.data);
           wx.setStorageSync('userImg',res.data.body.userImg);
            wx.setStorageSync('thirdAccount',res.data.body.thirdAccount);
         }
       })

  },
  login:function(){
        var userName = this.data.userName;//用户名
        var aesPassword = en.encrypt(this.data.userPwd,      app.globalData.aesKey,app.globalData.ivKey);//aes密码
         var nonce_str = rand.getRand();//随机数
         var postParams=[];
        postParams[0]=["username",this.data.userName];
        postParams[1]=["aesPassword",aesPassword];
        postParams[2]=["appId",app.globalData.appId];
        postParams[3]=["nonce_str",nonce_str];
        var signVal=sign.createSign(postParams,app.globalData.appKey);//签名
        
  var login_url= app.globalData.url+"/user/login.jspx?username="+this.data.userName+"&aesPassword="+aesPassword+"&appId="+app.globalData.appId+"&nonce_str="+nonce_str+"&sign="+signVal;
              var self=this;
        wx.request({//登录
          url: login_url,
          data: {},
          method: 'POST', 
          success: function(res){
            console.log(res.data);
               if(res.data.status=="true"){
                                 var sessionKey=res.data.body;
                    wx.setStorageSync('sessionKey',sessionKey);
                      wx.setStorageSync('userName',userName);
                       self.getInfo();
                     wx.navigateBack();
               }
               else{
                    wx.showModal({
                      title:"登录信息提示",
                      content:"登录失败",
                      complete:function(){
                         self.setData({
                           userName:"",
                           userPwd:""
                         })
                      }
                    })
               }
          }
        })
  },
  weixinLogin:function(){
      //发起微信登陆
      var self=this;

       wx.login({
            success: function(res) {
              if (res.code) {
                  console.log("res.code->"+res.code);
                 var nonce_str = rand.getRand();//随机数
                var postParams=[];
                
                var nickName;
                wx.getUserInfo({
                  success: function(userRes) {
                    var userInfo = userRes.userInfo;
                    var nickName = userInfo.nickName;
                    var avatarUrl = userInfo.avatarUrl;
                    var gender = userInfo.gender; //性别 0：未知、1：男、2：女 
                    var province = userInfo.province;
                    var city = userInfo.city;
                    var country = userInfo.country;
                    postParams[0]=["js_code",res.code];
                    postParams[1]=["grant_type","authorization_code"];
                    postParams[2]=["appId",app.globalData.appId];
                    postParams[3]=["nonce_str",nonce_str];
                    postParams[4]=["nickName",nickName];
                    postParams[5]=["avatarUrl",avatarUrl];
                    postParams[6]=["province",province];
                    postParams[7]=["city",city];
                    postParams[8]=["country",country];
                    var signVal=sign.createSign(postParams,app.globalData.appKey);//签名
                    //发起网络请求
                    wx.request({
                      url:  app.globalData.url+'/user/weixinLogin.jspx',
                      data: {
                        js_code: res.code,
                        grant_type:'authorization_code',
                        appId:app.globalData.appId,
                        nonce_str:nonce_str,
                        nickName:nickName,
                        avatarUrl:avatarUrl,
                        province:province,
                        city:city,
                        country:country,
                        sign:signVal
                      },
                      header: {
                          'content-type': 'application/x-www-form-urlencoded'
                      },
                      method:"POST",
                      success: function(loginRes){
                        console.log("login success->"+loginRes.data.status);
                          if(loginRes.data.status=="true"){
                            console.log(loginRes.data);
                            var sessionKey=loginRes.data.body.sessionKey;
                          
                            wx.setStorageSync('sessionKey',sessionKey);
                            wx.setStorageSync('userName',loginRes.data.body.username);
                              self.getInfo();
                            wx.navigateBack();
                            //wx.switchTab({
                             // url: '/pages/news/news'
                            //})              
                          }
                          else{
                              wx.showModal({
                                title:"登录信息提示",
                                content:"登录失败",
                                complete:function(){
                                  self.setData({
                                    userName:"",
                                    userPwd:""
                                  })
                                }
                              })
                          }
                      }
                    })
                  }
                });

              } else {
                console.log('获取用户登录态失败！' + res.errMsg)
              }
            }
        });
  }

})