
var app=getApp();
var news_url=app.globalData.url+"/content/list.jspx?siteIds=1&count=15&channelIds=75&https=0";

var img_url=app.globalData.url+"/content/list.jspx?siteIds=1&count=3&channelIds=76&https=0";
Page({
  data:{
     imgPath:[],
     fastData:{},
     newsDataArr:[],
     hidden:true,
     page:"",
     date:""
  },
  onLoad:function(options){ 
      var self=this;
      wx.showToast({
     title: '正在加载...',
     icon: 'loading',
    duration: 10000
})      
      //首页轮播加载
      wx.request({
        url:img_url,
        data: {},
        method: 'POST',
        success: function(res){
          self.setData({
             imgPath:res.data});
        },
        fail: function() {
          wx.showToast({
              title: "加载出错",
              icon: 'loading',
              duration:2000
           })      
        }
      })
      //新闻内容加载
       wx.request({
         url: news_url,
         data: {},
         method: 'POST',
         success: function(res){
          
         self.setData({
             newsDataArr:res.data,
             fastData:res.data[0],
             page:res.data.length},      
             
             );
             wx.hideToast();
         },
        fail:function(){
          console.log("error");
        }
       }); 
  },

  onReachBottom:function(){
   
     this.setData({hidden:false});
      var self=this;
     
          wx.request({
      url: news_url,
      data: {
        first:self.data.page
      },
      method: 'GET', 
      
      success: function(res){
    
        self.setData({
          newsDataArr:self.data.newsDataArr.concat(res.data),
          hidden:true,
          page:self.data.page+res.data.length
          });
        
      }
    })
  }


})