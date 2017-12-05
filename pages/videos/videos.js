var app=getApp();
var video_url= app.globalData.url+"/content/list.jspx?siteIds=1&count=15&channelIds=77&https=0";
Page({
  data:{
     videoData:[]
  },
   onLoad:function(options){
      app.showModel();
      var self=this;
      wx.request({
        url: video_url,
        data: {},
        method: 'POST', 
        success: function(res){
          console.log(res.data);
          self.setData({
              videoData:res.data
          })
          wx.hideToast();
        },
        fail: function() {
          // fail
        },
        complete: function() {
          // complete
        }
      })
  },

 
})
