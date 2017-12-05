var aa = getApp();
String.prototype.endWith=function(str){
  if(str==null||str==""||this.length==0||str.length>this.length)
    return false;
  if(this.substring(this.length-str.length)==str)
    return true;
  else
    return false;
  return true;
}
String.prototype.startWith=function(str){     
  var reg=new RegExp("^"+str);     
  return reg.test(this);        
}  
var flags=new Array();
var frag=[];
var tempFrag1=[],tempFrag2=[],tempFrag3=[],tempFrag4=[],tempFrag5=[],tempFrag6=[];
function getFlagArrar(txt){
  if(txt!=null&&txt.indexOf("_img_end_") > 0){
      tempFrag1=txt.split("_img_end_");
      for(var i=0;i<tempFrag1.length;i++){
           getFlagArrar(tempFrag1[i]);
      }
  }else if(txt!=null&&txt.indexOf("_video_end_") > 0){
      tempFrag2=txt.split("_video_end_");
      for(var i=0;i<tempFrag2.length;i++){
          getFlagArrar(tempFrag2[i]);
      }
  }else if(txt!=null&&txt.indexOf("_img_start_") > 0){
         //console.log("_img_start_->"+txt);
         tempFrag3=txt.split("_img_start_");
         for(var i=0;i<tempFrag3.length;i++){
            getFlagArrar(tempFrag3[i]);
         }
  }else if(txt!=null&&txt.indexOf("_video_start_") > 0){
         //console.log("_video_start_->"+txt);
         tempFrag4=txt.split("_video_start_");
         for(var i=0;i<tempFrag4.length;i++){
            getFlagArrar(tempFrag4[i]);
         }
  }else if(txt!=null&&txt.endWith(".mp4")){
        if(txt!=null&&txt.startWith("_video_start_")){
           tempFrag6=txt.split("_video_start_");
           for(var i=0;i<tempFrag6.length;i++){
               getFlagArrar(tempFrag6[i]);
           }
         }else{
            frag=[txt,3];
            flags.push(frag);
         }
  }else if(txt!=null&&(txt.endWith(".bmp")||txt.endWith(".jpg")||txt.endWith(".jpeg")||txt.endWith(".gif")||txt.endWith(".png"))){
         if(txt!=null&&txt.startWith("_img_start_")){
           tempFrag5=txt.split("_img_start_");
           for(var i=0;i<tempFrag5.length;i++){
               getFlagArrar(tempFrag5[i]);
           }
         }else{
            frag=[txt,2];
            flags.push(frag);
         }
  }else{
     //1正文类型  2图片  3视频
     frag=[txt,1];
     flags.push(frag);
  }
}


Page({
  data:{
      content:'',
      contentFrag:[][1],
      ups:"",
      upsImg:"../../icons/ups.png",
      collectImg:"../../icons/collect.png",
      operate:1,
      flag:0
  },
  onLoad:function(options){
      
      aa.showModel();
      var self=this;
      wx.request({
        url: aa.globalData.url+'/content/get.jspx',
        data: {
          https:0,
          format:1,
          id:options.id,
          sessionKey:wx.getStorageSync('sessionKey'),
          appId:aa.globalData.appId
        },
        header: {
          'content-type': 'application/json'
        },
        dataType:'json',
        method: 'GET', 
        success: function(res){
          
          flags=[]; 
          getFlagArrar(res.data.txt);
          //收藏
          if(res.data.hasCollect==true){
           
             self.setData(
               {
               collectImg:"../../icons/collect-active.png",
               operate:0
             })
          }
          self.setData({
            content:res.data,
            flags:flags,
            ups:res.data.ups
          })
           wx.hideToast();
         
        }
      })
  },
   getCommentList:function(){//评论跳转

      wx.navigateTo({
      url: '../comments/comments?id='+this.data.content.id
     })
   },


   up:function(){//点赞
          var app = getApp();
      var rand=require('../../utils/random.js');
      var sign=require('../../utils/sign.js');  
        var id=this.data.content.id;//内容id
         var appId=app.globalData.appId;//appid;
        var nonce_str=rand.getRand();//获取随机数
        //var sessionKey=wx.getStorageSync('sessionKey');
        var postParams=[];
        postParams[0]=["id",id];
        postParams[1]=["appId",appId];
        postParams[2]=["nonce_str",nonce_str];
       // postParams[3]=["sessionKey",sessionKey];
        var signVal=sign.createSign(postParams,app.globalData.appKey);//签名     
        var self=this;
    if(self.data.flag==1){

    }else{
         wx.request({
       url: aa.globalData.url+'/content/up.jspx?id='+id+"&appId="+appId+"&nonce_str="+nonce_str+"&sign="+signVal,
       data: {},
       method: 'POST', 
       success: function(res){
         console.log(res.data);
          if(res.data.status=="true"){     
              self.setData({ups:self.data.ups+1,
                 upsImg:"../../icons/ups-active.png",
                 flag:1
              });
             
          }
       }
     })
    }

    
   },
   collect:function(){//收藏
        var app = getApp();
        var rand=require('../../utils/random.js');
        var sign=require('../../utils/sign.js'); 
        var operate=this.data.operate;//0取消收藏1收藏
        var id=this.data.content.id;//内容id
        var appId=app.globalData.appId;//appid;
        var nonce_str=rand.getRand();//获取随机数
        var sessionKey=wx.getStorageSync('sessionKey');//sessionKey
        var postParams=[];
        postParams[0]=["id",id];
        postParams[1]=["appId",appId];
        postParams[2]=["nonce_str",nonce_str];
        postParams[3]=["sessionKey",sessionKey];
         postParams[4]=["operate",operate];
        var signVal=sign.createSign(postParams,app.globalData.appKey);//签名     

       var self=this;
      if(sessionKey==""||sessionKey==null){
        wx.showModal({
         title:"提示",
         content:"收藏需要登录，是否登录?",
         success:function(res){
               if (res.confirm) {
                  wx.navigateTo({
                    url:"../login/login"
                  })
                }
         }
       })
      }else{
       wx.request({
         url: aa.globalData.url+'/content/collect.jspx',
         data: {
           id:id,
           operate:operate,
           appId:appId,
           nonce_str:nonce_str,
           sign:signVal,
           sessionKey:sessionKey
         },
         method: 'GET', 
        
         success: function(res){
            console.log(res.data);
              if(res.data.status=="true"){
              console.log(self.data.operate);
                 if(self.data.operate==1){
                   self.setData({
                     collectImg:"../../icons/collect-active.png",
                       operate:0
                   })
                 }else{
                    self.setData({
                     collectImg:"../../icons/collect.png",
                       operate:1
                   })
                 }
              }
            }
         
       })
      }

    


   }


})