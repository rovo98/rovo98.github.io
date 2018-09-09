 <!--崩溃欺骗-->
 <!-- added by rovo98 -->
 var OriginTitle = document.title;
 var titleTime;
 document.addEventListener('visibilitychange', function () {
     if (document.hidden) {
         $('[rel="icon"]').attr('href', "/images/favicon-sad.png");
         document.title = '页面崩溃啦 ~';
         clearTimeout(titleTime);
     }
     else {
         $('[rel="icon"]').attr('href', "/images/favicon-happy.png");
         document.title = '噫又好了~' + OriginTitle;
         titleTime = setTimeout(function () {
             document.title = OriginTitle;
             $('[rel="icon"]').attr('href', '/images/my-favicon-32x32.png');
         }, 5000);
     }
 });
