---
title: Posts Ranking
date: 2018-09-09 10:16:07
comments: false
---
<div id="top"></div>
<script src="https://cdn1.lncld.net/static/js/av-core-mini-0.6.4.js"></script>
<script>AV.initialize("jUwzFlXSJ71zpvuEefX2F1aD-gzGzoHsz", "duLPBvpLL5Q5WAnwRHnBDaR5");</script>
<script type="text/javascript">
  var time=0
  var title=""
  var url=""
  var query = new AV.Query('Counter');
  query.notEqualTo('id',0);
  query.descending('time');
  query.limit(1000);
  query.find().then(function (todo) {
    for (var i=0;i<1000;i++){
      var result=todo[i].attributes;
      time=result.time;
      title=result.title;
      url=result.url;
      // var content="<a href='"+"https://hoxis.github.io"+url+"'>"+title+"</a>"+"<br>"+"<font color='#fff'>"+"阅读次数："+time+"</font>"+"<br><br>";
      var content="<p>"+"<font color='#1C1C1C'>"+"🔥Heat:"+time+"℃"+"</font>"+"<a href='"+url+"'> - "+title+"</a>"+"</p>";
      document.getElementById("top").innerHTML+=content
    }
  }, function (error) {
    console.log("error");
  });
</script>
<style type="text/css">
    #top p {
        margin: 0 0 20px 0;
        font-size: 1.1em;
    }
</style>
