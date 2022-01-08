const ap = new APlayer({
  container: document.getElementById('aplayer'),
  fixed: true,
  loop: 'all',
  preload: 'auto',
  volume: 0.7,
  order: 'random',
  audio: [{
    name: '絵空事',
    artist: 'nano.RIPE',
    url: 'http://music.163.com/song/media/outer/url?id=792165.mp3',
    cover: 'https://p2.music.126.net/IU_ZMcz1ciXEnT_9rxA-OA==/4461818185525384.jpg?param=130y130'
  },
  {
    name: '君の知らない物語',
    artist: 'Supercell',
    url: 'http://music.163.com/song/media/outer/url?id=399367218.mp3',
    cover: 'https://p1.music.126.net/2xRbMY_1iJVMPHtWZvhq_A==/2535473818087857.jpg?param=130y130'
  },
  {
    name: '僕が死のうと思ったのは',
    artist: '中島美嘉',
    url: 'http://music.163.com/song/media/outer/url?id=467011317.mp3',
    cover: 'https://p1.music.126.net/Rv7XgyTNKwJNS-PAtXvRag==/18247494975126406.jpg?param=130y130'
  },
  {
    name: '打上花火',
    artist: 'DAOKO / 米津玄師',
    url: 'http://music.163.com/song/media/outer/url?id=524149974.mp3',
    cover: 'https://p1.music.126.net/foHq40_kQ0L_4ntegSLLFw==/109951163088455433.jpg?param=130y130'
  },
  {
    name: '終わりの世界から',
    artist: 'やなぎなぎ / 麻枝准',
    url: 'http://music.163.com/song/media/outer/url?id=676508.mp3',
    cover: 'https://p2.music.126.net/C7ruDdV5NhgfhhJ8_cQSzA==/2426622162519258.jpg?param=130y130'
  },
  {
    name: 'China-X',
    artist: '徐梦圆',
    url: 'http://music.163.com/song/media/outer/url?id=41500546.mp3',
    cover: 'https://p1.music.126.net/hH4UmteuzsqZHacrr3YS_g==/18358545649308968.jpg?param=130y130'
  },
  {
    name: '心做し',
    artist: 'Sou',
    url: 'http://music.163.com/song/media/outer/url?id=39224533.mp3',
    cover: 'https://p1.music.126.net/2zT_bKdCwacIgJaKA0CaGw==/3254554419407436.jpg?param=130y130'
  },
  {
    name: '锦里',
    artist: 'HOPE-T / 接个吻，开一枪',
    url: 'http://music.163.com/song/media/outer/url?id=441617611.mp3',
    cover: 'https://p2.music.126.net/m7pdSoU19s4txS1v_w6p-A==/109951162810952889.jpg?param=130y130'
  },
  {
    name: '城南已花开',
    artist: '三亩地',
    url: 'http://music.163.com/song/media/outer/url?id=468176711.mp3',
    cover: 'https://p1.music.126.net/i-7ktILRPImJ0NwiH8DABg==/109951162885959979.jpg?param=130y130'
  },
  {
    name: 'アイロニ',
    artist: 'majiko',
    url: 'http://music.163.com/song/media/outer/url?id=31421442.mp3',
    cover: 'https://p2.music.126.net/4Zpn57gnArtV3F5xiNBK0g==/109951163598414321.jpg?param=130y130'
  }
  ]
})
