/*
--------------------------------------------------------------------------------------------------------------------------------------------------

TALETUNES

Elevate your game's atmosphere with taletunes, a tool for seamlessly blending ambient
soundscapes and music to match every moment. Set the perfect tone for every scene. Dynamic,
immersive sound-design at your fingertips.

--------------------------------------------------------------------------------------------------------------------------------------------------

TODO's:
  
random html downloads when refreshing during youtube api calls or service worker (liveserver or github pages)  

enable setting-start-position feature (Sascha) i.e: [12:37] for tunes^

fix/add loading default data if no saved data in local storage 

impuls wobble on click outline for toggle buttons 

(clone group)

remove console-log debugging mess

make ko-fi profile and update qr to ko-fi? 

--------------------------------------------------------------------------------------------------------------------------------------------------

https://getcssscan.com/css-box-shadow-examples
https://cable.ayra.ch/ytdl/playlist.php?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3Dkgq21eM26nY%26list%3DPLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W
https://developers.google.com/youtube/iframe_api_reference?hl=de
https://symbl.cc/de/

--------------------------------------------------------------------------------------------------------------------------------------------------
*/

let data = {
  groups: [],
  settings: [],
  mode: "play",
  titles: true,
  players: [],
};

class Group {
  constructor(name) {
    this.tunes = [];
    this.active = false;
    this.name = name.replace(/\s+/g, "_");
  }
}

class Tune {
  constructor(url) {
    this.url = url;
    this.tags = ""; //this.tags or central (all)?
    this.title = "";
    this.group = ""; // todo + refactor or nah? nah!
    this.isVolume = 0;
    this.player = null;
    this.killCounter = 0;
    this.startTime = 0;
    this.stepSize = 0.1;
    this.deleted = false;
    this.activeWorker = null;
    this.fadeTargetVolume = 0;
    this.trackController = "";
    this.trackControllerInfoBar = null;
  }
}

/*
--------------------------------------------------------------------------------------------------------------------------------------------------
*/

// build and return test data object
function testData() {
  const test_urls = [
    "https://www.youtube.com/watch?v=kgq21eM26nY",
    "https://www.youtube.com/watch?v=4KGBB32EPLw",
    "https://www.youtube.com/watch?v=KT_8_gQ4blM",
    "https://www.youtube.com/watch?v=R-V5NyN9XKo",
    "https://www.youtube.com/watch?v=EUer-Tto1ZA",
    "https://www.youtube.com/watch?v=fuGTBpd9ZxA",
    "https://www.youtube.com/watch?v=K2kyYtyY3jg",
    "https://www.youtube.com/watch?v=CLgh4FdXkAo",
    "https://www.youtube.com/watch?v=l62qjvh3MJk",
    "https://www.youtube.com/watch?v=DRFHklnN-SM",
    "https://www.youtube.com/watch?v=XXttTqz8oNc",
    "https://www.youtube.com/watch?v=zloJ_yptWU0",
    "https://www.youtube.com/watch?v=rKImvyg0thI",
    "https://www.youtube.com/watch?v=SA1ZM5_UFhQ",
    "https://www.youtube.com/watch?v=v2qOllkxwiw",
    "https://www.youtube.com/watch?v=W9dfVFwS_Ro",
    "https://www.youtube.com/watch?v=ocJlogyxxNY",
    "https://www.youtube.com/watch?v=_X2E2MPEDDU",
    "https://www.youtube.com/watch?v=SA7uXNeVRjs",
    "https://www.youtube.com/watch?v=cy6rfPqUDLY",
    "https://www.youtube.com/watch?v=c43mpm0yXK8",
    "https://www.youtube.com/watch?v=DjOm3_xial8",
    "https://www.youtube.com/watch?v=M7iXsGh5YP0",
    "https://www.youtube.com/watch?v=-gcVy-pS0GY",
    "https://www.youtube.com/watch?v=0qd1D2jiA6w",
    "https://www.youtube.com/watch?v=zdRNW9iLEwg",
    "https://www.youtube.com/watch?v=hNFM2f4BvAo",
    "https://www.youtube.com/watch?v=uhyxSmOhls4",
    "https://www.youtube.com/watch?v=tvS27wzsk8w",
    "https://www.youtube.com/watch?v=LUO5qhpD2pA",
    "https://www.youtube.com/watch?v=rWwpKDhi0TE",
    "https://www.youtube.com/watch?v=rPt79QYxXEc",
    "https://www.youtube.com/watch?v=DH1WLblsa3o",
    "https://www.youtube.com/watch?v=98AMVwqJ25E",
    "https://www.youtube.com/watch?v=p8ov9f8NISk",
    "https://www.youtube.com/watch?v=fCK8-2pdtFU",
    "https://www.youtube.com/watch?v=TkodnfN4kUQ",
    "https://www.youtube.com/watch?v=YZPmfajMcyw",
    "https://www.youtube.com/watch?v=jIp4J62aRvY",
    "https://www.youtube.com/watch?v=hHwqfT4mhfI",
    "https://www.youtube.com/watch?v=3QXBWRQQ1K0",
    "https://www.youtube.com/watch?v=tFAjJsqdO_A",
    "https://www.youtube.com/watch?v=iHFy98hLPRw",
    "https://www.youtube.com/watch?v=9BnuniL0lAU",
    "https://www.youtube.com/watch?v=E4JuVc-kty4",
    "https://www.youtube.com/watch?v=Y7EZBP9j7h0",
    "https://www.youtube.com/watch?v=MIpJBOD8-yw",
    "https://www.youtube.com/watch?v=kgq21eM26nY",
    "https://www.youtube.com/watch?v=nsDm36osJW8",
    "https://www.youtube.com/watch?v=w5xjwFCwu5Y",
    "https://www.youtube.com/watch?v=lIWUbZDJfK0",
    "https://www.youtube.com/watch?v=eBf4s0HfgjQ",
    "https://www.youtube.com/watch?v=3NUDlaEIawQ",
    "https://www.youtube.com/watch?v=k4kNKVKFKHY",
    "https://www.youtube.com/watch?v=KAqUpjcs_xc",
    "https://www.youtube.com/watch?v=D0PPaiqiNAU",
    "https://www.youtube.com/watch?v=7Eberj36hHA",
    "https://www.youtube.com/watch?v=_f_4Ywfjax4",
    "https://www.youtube.com/watch?v=VaKVLWZrG-4",
    "https://www.youtube.com/watch?v=GIzVrvwMJy8",
    "https://www.youtube.com/watch?v=B7ni4VEzEgA",
    "https://www.youtube.com/watch?v=dxwJuo_KejY",
    "https://www.youtube.com/watch?v=FmcIbp9aYxk",
    "https://www.youtube.com/watch?v=PPl__iyIg6w",
    "https://www.youtube.com/watch?v=IYKf2MyQfWM",
    "https://www.youtube.com/watch?v=xrOXhZjyxfY",
    "https://www.youtube.com/watch?v=1dErsmYTkOE",
    "https://www.youtube.com/watch?v=q5MFnhqjyjs",
    "https://www.youtube.com/watch?v=QXfp_edmYPo",
    "https://www.youtube.com/watch?v=mFsQpCjRyvY",
    "https://www.youtube.com/watch?v=_Z1VzsE1GVg",
    "https://www.youtube.com/watch?v=L9wROb-h4vU",
    "https://www.youtube.com/watch?v=YPZtRmx1Dyk",
    "https://www.youtube.com/watch?v=5s3grF0hDXM",
    "https://www.youtube.com/watch?v=fHGXCw5aLrs",
    "https://www.youtube.com/watch?v=2GX9lVHfnxs",
    "https://www.youtube.com/watch?v=FNBf2yNOzhY",
    "https://www.youtube.com/watch?v=fbl1DU70lvM",
    "https://www.youtube.com/watch?v=98-avFAtphk",
    "https://www.youtube.com/watch?v=Z6ylGHfLrdI",
    "https://www.youtube.com/watch?v=Jg_QwWE_5cY",
    "https://www.youtube.com/watch?v=JIlgFF2mxk4",
    "https://www.youtube.com/watch?v=ARHH8kYYOho",
    "https://www.youtube.com/watch?v=PtIKsk1Qabw",
    "https://www.youtube.com/watch?v=OGiqwfQqoaw",
    "https://www.youtube.com/watch?v=KSSpVMIgN2Y",
    "https://www.youtube.com/watch?v=VkWRdaz7GKw",
    "https://www.youtube.com/watch?v=RD5Xppk1d6A",
    "https://www.youtube.com/watch?v=ZJR8tuO-mIU",
    "https://www.youtube.com/watch?v=MBlAEE4JyCs",
    "https://www.youtube.com/watch?v=wkfb7bao5G8",
    "https://www.youtube.com/watch?v=xpa1fxM_NPs",
    "https://www.youtube.com/watch?v=L8CPM1_0t0M",
    "https://www.youtube.com/watch?v=sxQzrAIS6W0",
    "https://www.youtube.com/watch?v=DbsDnlPe96s",
    "https://www.youtube.com/watch?v=WPpVMmTt74Q",
    "https://www.youtube.com/watch?v=bxoRRobHtGM",
    "https://www.youtube.com/watch?v=PBxXlDY0QP0",
    "https://www.youtube.com/watch?v=i2Kr5aCdUUI",
    "https://www.youtube.com/watch?v=JbvLR2qOH4Y",
    "https://www.youtube.com/watch?v=QIYaDnDHCXw",
    "https://www.youtube.com/watch?v=x67GelOetvo",
    "https://www.youtube.com/watch?v=b3qm40KjjqI",
    "https://www.youtube.com/watch?v=cgrWysVeolQ",
    "https://www.youtube.com/watch?v=W2NAblVD70Q",
    "https://www.youtube.com/watch?v=958NL0xgjIU",
    "https://www.youtube.com/watch?v=cy6rfPqUDLY",
    "https://www.youtube.com/watch?v=2UPkwe_5p_w",
    "https://www.youtube.com/watch?v=tvTsUs0n9zw",
    "https://www.youtube.com/watch?v=nrYFifkoBGQ",
    "https://www.youtube.com/watch?v=fjSP7BQghWE",
    "https://www.youtube.com/watch?v=cmedlfRszXU",
    "https://www.youtube.com/watch?v=HlP8B0KrJxk",
    "https://www.youtube.com/watch?v=s42Y9T7H1b8",
    "https://www.youtube.com/watch?v=AfN3_ERtn3E",
    "https://www.youtube.com/watch?v=O361ES3Yt_E",
    "https://www.youtube.com/watch?v=XDY4GdU1dPU",
    "https://www.youtube.com/watch?v=bNOmxepDcm4",
    "https://www.youtube.com/watch?v=_YpKEpF0oxo",
    "https://www.youtube.com/watch?v=Uo0qBqJTkUI",
    "https://www.youtube.com/watch?v=CGYJeaJBRvk",
    "https://www.youtube.com/watch?v=EETzt6wNvgY",
    "https://www.youtube.com/watch?v=7HiOuTpi5dg",
    "https://www.youtube.com/watch?v=-QrMCervc9M",
    "https://www.youtube.com/watch?v=n--SX54AUZU",
    "https://www.youtube.com/watch?v=5o_uF1L5l6o",
    "https://www.youtube.com/watch?v=F2X46cXnm74",
    "https://www.youtube.com/watch?v=4xDzrJKXOOY",
    "https://www.youtube.com/watch?v=Vnl4ryyGkSQ",
    "https://www.youtube.com/watch?v=IAb-r3q9gLE",
    "https://www.youtube.com/watch?v=xye0MVLtqgw",
    "https://www.youtube.com/watch?v=U__1_2trJAk",
    "https://www.youtube.com/watch?v=aWfgFaABhEY",
    "https://www.youtube.com/watch?v=00PEj-ysJng",
    "https://www.youtube.com/watch?v=DjMKwLkgS-k",
    "https://www.youtube.com/watch?v=f1tYe3TkhTc",
    "https://www.youtube.com/watch?v=SA7uXNeVRjs",
    "https://www.youtube.com/watch?v=ch-HHGuzwRU",
    "https://www.youtube.com/watch?v=PYKir9gF6rQ",
    "https://www.youtube.com/watch?v=5RHTt4_XVVU",
    "https://www.youtube.com/watch?v=Iq50wDUOXFU",
    "https://www.youtube.com/watch?v=r1PopjZ6_Hg",
    "https://www.youtube.com/watch?v=62j1xAdYKAQ",
    "https://www.youtube.com/watch?v=gVKEM4K8J8A",
    "https://www.youtube.com/watch?v=yR2ElHDhPVo",
    "https://www.youtube.com/watch?v=-5yLge1MkYc",
    "https://www.youtube.com/watch?v=_XTebxxHO9Q",
    "https://www.youtube.com/watch?v=IH78DGFiQ5E",
    "https://www.youtube.com/watch?v=t-lFeAQlTzE",
    "https://www.youtube.com/watch?v=pXt8N04UcXw",
    "https://www.youtube.com/watch?v=6VHi08a65Eg",
    "https://www.youtube.com/watch?v=W9dfVFwS_Ro",
    "https://www.youtube.com/watch?v=UIHPS5sZINw",
    "https://www.youtube.com/watch?v=Z_Zr4u45OSY",
    "https://www.youtube.com/watch?v=f3u000tEXxs",
    "https://www.youtube.com/watch?v=tvTsUs0n9zw",
    "https://www.youtube.com/watch?v=uLpRctqGTWw",
    "https://www.youtube.com/watch?v=1ztGmjYfLow",
    "https://www.youtube.com/watch?v=vLJLzgphzcE",
    "https://www.youtube.com/watch?v=LRBchk7SboI",
    "https://www.youtube.com/watch?v=H5NZtbbiyKM",
    "https://www.youtube.com/watch?v=haeawk955VQ",
    "https://www.youtube.com/watch?v=ErGjpy5TnOE",
    "https://www.youtube.com/watch?v=CDWtH8eHeEU",
    "https://www.youtube.com/watch?v=rA_12IbK7Do",
    "https://www.youtube.com/watch?v=wBSZw88Xjtg",
    "https://www.youtube.com/watch?v=xlC6_UIUlz0",
    "https://www.youtube.com/watch?v=-yM1TbN5_A8",
    "https://www.youtube.com/watch?v=wgJIym3uBI4",
    "https://www.youtube.com/watch?v=-r9cvBWjGKM",
    "https://www.youtube.com/watch?v=2Nm65Rmf5fA",
    "https://www.youtube.com/watch?v=xFjo0QIOhbw",
    "https://www.youtube.com/watch?v=NfGosiTRmEU",
    "https://www.youtube.com/watch?v=MluX1Liz7Xs",
    "https://www.youtube.com/watch?v=7nt9it0yEJ0",
    "https://www.youtube.com/watch?v=-fWlYZNnSdA",
    "https://www.youtube.com/watch?v=yaPafrqUvI8",
    "https://www.youtube.com/watch?v=yV4Qthj0EOs",
    "https://www.youtube.com/watch?v=wF7zy5FANz4",
    "https://www.youtube.com/watch?v=VU1kl1nJgtA",
    "https://www.youtube.com/watch?v=mQzvCOKLiX8",
    "https://www.youtube.com/watch?v=emn7ap9mS4U",
    "https://www.youtube.com/watch?v=FS5cUVqj19c",
    "https://www.youtube.com/watch?v=m4oZZhpMXP4",
    "https://www.youtube.com/watch?v=oE-pXV-G9aY",
    "https://www.youtube.com/watch?v=oJsn9bGXaMU",
    "https://www.youtube.com/watch?v=MaaR86EwQXc",
    "https://www.youtube.com/watch?v=Efuz-_kohYU",
    "https://www.youtube.com/watch?v=DzNsmMOYbWQ",
    "https://www.youtube.com/watch?v=syp6Lsd8HOo",
    "https://www.youtube.com/watch?v=O3bWtSf73EI",
    "https://www.youtube.com/watch?v=n8bEX_I0gHQ",
    "https://www.youtube.com/watch?v=SXlgLr_LAJc",
    "https://www.youtube.com/watch?v=GEGnVZypwHk",
    "https://www.youtube.com/watch?v=hf0n3T_5nTc",
    "https://www.youtube.com/watch?v=yzZ0HdzHOho",
    "https://www.youtube.com/watch?v=66RGXL3RPio",
    "https://www.youtube.com/watch?v=cY4NEyitfdw",
    "https://www.youtube.com/watch?v=4-8K4JdkovE",
    "https://www.youtube.com/watch?v=jYwrz7muVw8",
    "https://www.youtube.com/watch?v=fq_ZTJqJTcc",
    "https://www.youtube.com/watch?v=8pNjxwn7i5k",
    "https://www.youtube.com/watch?v=eCbyqm9jcBA",
    "https://www.youtube.com/watch?v=3Lt2kuxPIcQ",
    "https://www.youtube.com/watch?v=DhVGAzC1IAk",
    "https://www.youtube.com/watch?v=09xBtJgDzIQ",
    "https://www.youtube.com/watch?v=oJ4pr549ytw",
    "https://www.youtube.com/watch?v=SwXCot0h5jk",
    "https://www.youtube.com/watch?v=ma-kbUMole8",
    "https://www.youtube.com/watch?v=aYTeoqe0cNU",
    "https://www.youtube.com/watch?v=M16q9oD6DwM",
    "https://www.youtube.com/watch?v=ZVb_yKMivqo",
    "https://www.youtube.com/watch?v=F8bYaMoQ2sM",
    "https://www.youtube.com/watch?v=-MwZxXwsSOs",
    "https://www.youtube.com/watch?v=tpi5qsXm_cM",
    "https://www.youtube.com/watch?v=KvXRg6HlDoU",
    "https://www.youtube.com/watch?v=P-EVYJ6GSpI",
    "https://www.youtube.com/watch?v=t3B802PIuB0",
    "https://www.youtube.com/watch?v=rSkX8kQ3wh4",
    "https://www.youtube.com/watch?v=7wBzL62Va1k",
    "https://www.youtube.com/watch?v=WW4bdFhcZgw",
    "https://www.youtube.com/watch?v=n--JsJ3AlKA",
    "https://www.youtube.com/watch?v=QlXrndlCFIk",
    "https://www.youtube.com/watch?v=EcLZE4KVc_E",
    "https://www.youtube.com/watch?v=FxOtJq-Tkys",
    "https://www.youtube.com/watch?v=aW9wBjkpWIE",
    "https://www.youtube.com/watch?v=0yTKiFXTdeI",
    "https://www.youtube.com/watch?v=RPkHu8M_U4c",
    "https://www.youtube.com/watch?v=5Jzp5H4mQVE",
    "https://www.youtube.com/watch?v=hCVA_0vRisw",
    "https://www.youtube.com/watch?v=4E-_Xpj0Mgo",
    "https://www.youtube.com/watch?v=ddMSMwKQkKI",
    "https://www.youtube.com/watch?v=So0H1kyn6FY",
    "https://www.youtube.com/watch?v=HsdlX1E-Tv8",
    "https://www.youtube.com/watch?v=synJbsrk0k8",
    "https://www.youtube.com/watch?v=ccj1AiFE02U",
    "https://www.youtube.com/watch?v=HAw37tUHcOo",
    "https://www.youtube.com/watch?v=JyyQlYRqvRs",
    "https://www.youtube.com/watch?v=Jikm8CCRbdM",
  ];

  // holds previously saved data
  const testData = {
    groups: [
      buildGroup("nature_0", [
        "https://www.youtube.com/watch?v=omBqRDJZhc8&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=34",
        "https://www.youtube.com/watch?v=xNN7iTA57jM&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=2",
        "https://www.youtube.com/watch?v=F8bYaMoQ2sM&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=78",
        "https://www.youtube.com/watch?v=5Jzp5H4mQVE",
        "https://www.youtube.com/watch?v=vSPe1o87bJE&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=21",
        "https://www.youtube.com/watch?v=juMabblyLZU&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=26",
        "https://www.youtube.com/watch?v=Ha0i6RUu_Hg&list=PLniTzKxa2c_dxZoQ_0L5kDpIChdiJnCR9",
        "https://www.youtube.com/watch?v=XXJ35GGOJEY&list=PLniTzKxa2c_drhk_HxO2dfHz6EyPJzUvi&index=12",
        "https://www.youtube.com/watch?v=NvBS6NWewxU",
      ]),
      buildGroup("nature_1", [
        "https://www.youtube.com/watch?v=juMabblyLZU&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=26",
        "https://www.youtube.com/watch?v=_XTebxxHO9Q&list=PLniTzKxa2c_fw0bldtN6zJVRdXGNcqlt6&index=27",
        "https://www.youtube.com/watch?v=Iq50wDUOXFU&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=3",
        "https://www.youtube.com/watch?v=5QoO-kNCcFE&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=25",
        "https://www.youtube.com/watch?v=yJf8Txhy1aQ&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=28",
        "https://www.youtube.com/watch?v=kzBx8TWcrG4&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=45",
        "https://www.youtube.com/watch?v=oAY4pNiB5Vw",
      ]),
      buildGroup("battle_0", [
        "https://www.youtube.com/watch?v=cTLuZB8qyOI&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=9",
        "https://www.youtube.com/watch?v=t3B802PIuB0&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=82",
        "https://www.youtube.com/watch?v=0Rzi72BrwnE&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=6",
        "https://www.youtube.com/watch?v=YIMZdELPBtU&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=23",
        "https://www.youtube.com/watch?v=ahL4VXohPdU&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=50",
        "https://www.youtube.com/watch?v=4G_CC6GXgQM&list=PLniTzKxa2c_dxZoQ_0L5kDpIChdiJnCR9&index=5",
        "https://www.youtube.com/watch?v=w0sUw735gRw&list=PLniTzKxa2c_fw0bldtN6zJVRdXGNcqlt6&index=16",
        "https://www.youtube.com/watch?v=VkWRdaz7GKw&list=PLniTzKxa2c_fw0bldtN6zJVRdXGNcqlt6&index=23",
      ]),
      buildGroup("battle_1", [
        "https://www.youtube.com/watch?v=_YpKEpF0oxo&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=23",
        "https://www.youtube.com/watch?v=wF7zy5FANz4&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=43",
        "https://www.youtube.com/watch?v=-MwZxXwsSOs&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=78",
        "https://www.youtube.com/watch?v=pGw2ztHACxA&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=6",
        "https://www.youtube.com/watch?v=nno7lATrpUY&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=35",
        "https://www.youtube.com/watch?v=TnjiGVlbcpk&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=38",
        "https://www.youtube.com/watch?v=2ya2drfb4rA",
      ]),
      buildGroup("boss_fight_0", [
        "https://www.youtube.com/watch?v=ROpi0LoaP2c&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=20",
        "https://www.youtube.com/watch?v=KU5EzBErrZ4&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=40",
        "https://www.youtube.com/watch?v=ZXXGpziGgs4&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=48",
        "https://www.youtube.com/watch?v=VAZhYlfdGfU&list=PLniTzKxa2c_dxZoQ_0L5kDpIChdiJnCR9&index=12",
        "https://www.youtube.com/watch?v=1ztGmjYfLow&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=21",
        "https://www.youtube.com/watch?v=So0H1kyn6FY&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=97",
      ]),
      buildGroup("desert_0", [
        "https://www.youtube.com/watch?v=kArgjNWRo68&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=50",
        "https://www.youtube.com/watch?v=1ztGmjYfLow&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=21",
      ]),
      buildGroup("mystery_0", [
        "https://www.youtube.com/watch?v=7wBzL62Va1k&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=84",
        "https://www.youtube.com/watch?v=EcLZE4KVc_E&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=88",
      ]),
      buildGroup("heist_0", [
        "https://www.youtube.com/watch?v=WW4bdFhcZgw&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=85",
        "https://www.youtube.com/watch?v=n--JsJ3AlKA&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=86",
      ]),
      buildGroup("weather_0", [
        "https://www.youtube.com/watch?v=KSSpVMIgN2Y&list=PLniTzKxa2c_fw0bldtN6zJVRdXGNcqlt6",
        "https://www.youtube.com/watch?v=gVKEM4K8J8A&list=PLniTzKxa2c_fw0bldtN6zJVRdXGNcqlt6&index=18",
        "https://www.youtube.com/watch?v=P-EVYJ6GSpI&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=81",
      ]),
      buildGroup("inside_0", [
        "https://www.youtube.com/watch?v=TkhH76W_mK4&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=14",
        "https://www.youtube.com/watch?v=ulplqXTp4R0&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=25",
        "https://www.youtube.com/watch?v=6wqGQunWqgM&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=41",
        "https://www.youtube.com/watch?v=WyG9Lh--fGA&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=43",
      ]),
      buildGroup("ambience_0", [
        "https://www.youtube.com/watch?v=Jikm8CCRbdM&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=103",
        "https://www.youtube.com/watch?v=eNDr0IAw2po&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=16",
        "https://www.youtube.com/watch?v=eD_xrmGI18I&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=30",
        "https://www.youtube.com/watch?v=nfl3cwqOQvc&list=PLniTzKxa2c_drhk_HxO2dfHz6EyPJzUvi&index=9",
        "https://www.youtube.com/watch?v=HmZ9Cp4PBNU&list=PLniTzKxa2c_drhk_HxO2dfHz6EyPJzUvi&index=14",
        "https://www.youtube.com/watch?v=FnEzJkJSrQ0&list=PLniTzKxa2c_drhk_HxO2dfHz6EyPJzUvi&index=16",
        "https://www.youtube.com/watch?v=s9UdWnO4W4k&list=PLniTzKxa2c_fw0bldtN6zJVRdXGNcqlt6&index=3",
        "https://www.youtube.com/watch?v=B7ni4VEzEgA&list=PLniTzKxa2c_fw0bldtN6zJVRdXGNcqlt6&index=8",
      ]),
      buildGroup("ambience_1", [
        "https://www.youtube.com/watch?v=62j1xAdYKAQ&list=PLniTzKxa2c_fw0bldtN6zJVRdXGNcqlt6&index=17",
        "https://www.youtube.com/watch?v=6U8K6SPPNLA&list=PLniTzKxa2c_fw0bldtN6zJVRdXGNcqlt6&index=21",
        "https://www.youtube.com/watch?v=NoFfgJbkl-o&list=PLniTzKxa2c_fw0bldtN6zJVRdXGNcqlt6&index=24",
        "https://www.youtube.com/watch?v=IH78DGFiQ5E&list=PLniTzKxa2c_fw0bldtN6zJVRdXGNcqlt6&index=26",
        "https://www.youtube.com/watch?v=H5NZtbbiyKM&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=25",
        "https://www.youtube.com/watch?v=VU1kl1nJgtA&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=44",
        "https://www.youtube.com/watch?v=ddMSMwKQkKI&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=96",
        "https://www.youtube.com/watch?v=HsdlX1E-Tv8&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=98",
      ]),
      buildGroup("ambience_2", [
        "https://www.youtube.com/watch?v=d4ZTv6hNOSg",
        "https://www.youtube.com/watch?v=t12EjT4CO14",
        "https://www.youtube.com/watch?v=ccj1AiFE02U&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=100",
      ]),
      buildGroup("tense_0", [
        "https://www.youtube.com/watch?v=waPY44w5Zpk&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=12",
        "https://www.youtube.com/watch?v=ET5Sqg5t-W8&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=18",
        "https://www.youtube.com/watch?v=r1PopjZ6_Hg&list=PLniTzKxa2c_dxZoQ_0L5kDpIChdiJnCR9&index=7",
        "https://www.youtube.com/watch?v=2WChXX9R3zM&list=PLniTzKxa2c_dxZoQ_0L5kDpIChdiJnCR9&index=15",
        "https://www.youtube.com/watch?v=KpV9igkB_Kw&list=PLniTzKxa2c_drhk_HxO2dfHz6EyPJzUvi&index=3",
        "https://www.youtube.com/watch?v=0QCRbf4PKbY&list=PLniTzKxa2c_drhk_HxO2dfHz6EyPJzUvi&index=5",
        "https://www.youtube.com/watch?v=wBSZw88Xjtg&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=30",
      ]),
      buildGroup("tense_1", [
        "https://www.youtube.com/watch?v=wgJIym3uBI4&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=33",
        "https://www.youtube.com/watch?v=FxOtJq-Tkys&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=89",
        "https://www.youtube.com/watch?v=aW9wBjkpWIE&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=90",
      ]),
      buildGroup("ritual_0", [
        "https://www.youtube.com/watch?v=5Jzp5H4mQVE",
        "https://www.youtube.com/watch?v=E0VCNB9Ep2M&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=41",
        "https://www.youtube.com/watch?v=3TnGiZLxb5U&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=53",
        "https://www.youtube.com/watch?v=AfN3_ERtn3E&list=PLniTzKxa2c_dxZoQ_0L5kDpIChdiJnCR9&index=6",
        "https://www.youtube.com/watch?v=bNOmxepDcm4&list=PLniTzKxa2c_dxZoQ_0L5kDpIChdiJnCR9&index=13",
        "https://www.youtube.com/watch?v=I0n7DbaEMX0&list=PLniTzKxa2c_drhk_HxO2dfHz6EyPJzUvi&index=11",
        "https://www.youtube.com/watch?v=vLJLzgphzcE&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=22",
      ]),
      buildGroup("dungeon_0", [
        "https://www.youtube.com/watch?v=SXlgLr_LAJc&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=57",
        "https://www.youtube.com/watch?v=tB_c1R_ir9U&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=42",
        "https://www.youtube.com/watch?v=OtfgXgclSxU&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=9",
        "https://www.youtube.com/watch?v=sxQzrAIS6W0&list=PLniTzKxa2c_drhk_HxO2dfHz6EyPJzUvi",
        "https://www.youtube.com/watch?v=cgrWysVeolQ&list=PLniTzKxa2c_drhk_HxO2dfHz6EyPJzUvi&index=17",
        "https://www.youtube.com/watch?v=GEGnVZypwHk&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=58",
        "https://www.youtube.com/watch?v=EUtE1k0VXKI&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=11",
        "https://www.youtube.com/watch?v=GwNywGXlgUA&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=27",
      ]),
      buildGroup("dungeon_1", [
        "https://www.youtube.com/watch?v=IPViApBg6Qc&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=37",
      ]),
      buildGroup("emotion_0", [
        "https://www.youtube.com/watch?v=S9FsrV72wGY&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=5",
        "https://www.youtube.com/watch?v=HCN51NOW5IE&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=46",
        "https://www.youtube.com/watch?v=rnrK3zxsKdA&list=PLniTzKxa2c_dxZoQ_0L5kDpIChdiJnCR9&index=10",
        "https://www.youtube.com/watch?v=azoIyy-n42k&list=PLniTzKxa2c_fw0bldtN6zJVRdXGNcqlt6&index=29",
        "https://www.youtube.com/watch?v=emn7ap9mS4U&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=46",
        "https://www.youtube.com/watch?v=oJsn9bGXaMU&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=50",
        "https://www.youtube.com/watch?v=eCbyqm9jcBA&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=68",
        "https://www.youtube.com/watch?v=synJbsrk0k8&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=99",
      ]),
      buildGroup("gods_0", [
        "https://www.youtube.com/watch?v=S9FsrV72wGY&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=5",
        "https://www.youtube.com/watch?v=G9PrCVOg0lg&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=27",
        "https://www.youtube.com/watch?v=k5xDyG72wHE&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=29",
        "https://www.youtube.com/watch?v=_egA9RZrD5k&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=31",
        "https://www.youtube.com/watch?v=hPtkaIKdM3M&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=32",
        "https://www.youtube.com/watch?v=x8BpnUyHGoE&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=33",
        "https://www.youtube.com/watch?v=lCoksbLp9Nk&list=PLniTzKxa2c_drhk_HxO2dfHz6EyPJzUvi&index=2",
        "https://www.youtube.com/watch?v=yR2ElHDhPVo&list=PLniTzKxa2c_fw0bldtN6zJVRdXGNcqlt6&index=20",
      ]),
      buildGroup("gods_1", [
        "https://www.youtube.com/watch?v=0lyT8L5cv88&list=PLniTzKxa2c_fw0bldtN6zJVRdXGNcqlt6&index=28",
        "https://www.youtube.com/watch?v=FS5cUVqj19c&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=47",
        "https://www.youtube.com/watch?v=m4oZZhpMXP4&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=48",
        "https://www.youtube.com/watch?v=58lFnPdsvpU&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=39",
      ]),
      buildGroup("portals_0", [
        "https://www.youtube.com/watch?v=BIy_eL8hfAM&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=19",
        "https://www.youtube.com/watch?v=s4NFqPrTD9E&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=23",
      ]),
      buildGroup("water_0", [
        "https://www.youtube.com/watch?v=F4waBOxXCcg",
        "https://www.youtube.com/watch?v=IvjMgVS6kng",
        "https://www.youtube.com/watch?v=nZwfh_Q4ON0&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=47",
        "https://www.youtube.com/watch?v=YIVUPknhUWs&list=PLniTzKxa2c_drhk_HxO2dfHz6EyPJzUvi&index=6",
        "https://www.youtube.com/watch?v=KvXRg6HlDoU&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=80",
        "https://www.youtube.com/watch?v=-0HxUdJP_xY&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=21",
      ]),
      buildGroup("fey_0", [
        "https://www.youtube.com/watch?v=FpjM3fuzE6s&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=57",
        "https://www.youtube.com/watch?v=dxwJuo_KejY&list=PLniTzKxa2c_fw0bldtN6zJVRdXGNcqlt6&index=31",
        "https://www.youtube.com/watch?v=6VHi08a65Eg&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=15",
        "https://www.youtube.com/watch?v=DzNsmMOYbWQ&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=53",
        "https://www.youtube.com/watch?v=syp6Lsd8HOo&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=54",
      ]),
      buildGroup("town_0", [
        "https://www.youtube.com/watch?v=82Qm3a3ngug&list=PLniTzKxa2c_drhk_HxO2dfHz6EyPJzUvi&index=15",
        "https://www.youtube.com/watch?v=YZkFjWJVt6c&list=PLniTzKxa2c_dxZoQ_0L5kDpIChdiJnCR9&index=2",
        "https://www.youtube.com/watch?v=CY97XoaEjFg&list=PLniTzKxa2c_dxZoQ_0L5kDpIChdiJnCR9&index=8",
        "https://www.youtube.com/watch?v=_52K0E_gNY0&list=PLniTzKxa2c_dxZoQ_0L5kDpIChdiJnCR9&index=11",
        "https://www.youtube.com/watch?v=WJrqwa6tMQY&list=PLniTzKxa2c_dxZoQ_0L5kDpIChdiJnCR9&index=16",
        "https://www.youtube.com/watch?v=x2UulCWGess&list=PLniTzKxa2c_fw0bldtN6zJVRdXGNcqlt6&index=4",
        "https://www.youtube.com/watch?v=-r9cvBWjGKM&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=34",
        "https://www.youtube.com/watch?v=mDK9En7z1iA&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=7",
      ]),
      buildGroup("town_0", [
        "https://www.youtube.com/watch?v=__Hp8VDXYmA&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=22",
        "https://www.youtube.com/watch?v=6sPF5JmQ924&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=26",
        "https://www.youtube.com/watch?v=YZkFjWJVt6c&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=47",
        "https://www.youtube.com/watch?v=ddMSMwKQkKI&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=96",
      ]),
      buildGroup("festive_0", [
        "https://www.youtube.com/watch?v=4JPprEIcsWE&list=PLniTzKxa2c_dxZoQ_0L5kDpIChdiJnCR9&index=9",
        "https://www.youtube.com/watch?v=CY97XoaEjFg&list=PLniTzKxa2c_dxZoQ_0L5kDpIChdiJnCR9&index=8",
        "https://www.youtube.com/watch?v=JyyQlYRqvRs&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=102",
      ]),
      buildGroup("rest_0", [
        "https://www.youtube.com/watch?v=7KFoj-SOfHs&list=PLniTzKxa2c_dxZoQ_0L5kDpIChdiJnCR9&index=14",
        "https://www.youtube.com/watch?v=Ftm2uv7-Ybw",
      ]),
      buildGroup("crowds_0", [
        "https://www.youtube.com/watch?v=UNibrdgIVSw&list=PLniTzKxa2c_drhk_HxO2dfHz6EyPJzUvi&index=10",
        "https://www.youtube.com/watch?v=__Hp8VDXYmA&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=22",
        "https://www.youtube.com/watch?v=oywkwIlxN0E&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=33",
      ]),
      buildGroup("transport_0", [
        "https://www.youtube.com/watch?v=shk4NDhuI0c&list=PLniTzKxa2c_fw0bldtN6zJVRdXGNcqlt6&index=19",
        "https://www.youtube.com/watch?v=65TV8jhp9Ns&t=67s",
      ]),
      buildGroup("teasers_0", [
        "https://www.youtube.com/watch?v=grFQygwA27k&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=19",
        "https://www.youtube.com/watch?v=OT2IfhFYVZw&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=18",
        "https://www.youtube.com/watch?v=yVMckBB66-w&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=14",
        "https://www.youtube.com/watch?v=lWvRxwH0l2o&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=3",
        "https://www.youtube.com/watch?v=kguRBy9WooU&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=4",
        "https://www.youtube.com/watch?v=HmUknzxOtlY&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=5",
        "https://www.youtube.com/watch?v=sQ3-3-7UkoE&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=6",
      ]),
      buildGroup("teasers_1", [
        "https://www.youtube.com/watch?v=3oXerzmL430&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=7",
        "https://www.youtube.com/watch?v=SFl6EDylHbM&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=9",
        "https://www.youtube.com/watch?v=cILNjq77Thg&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=10",
        "https://www.youtube.com/watch?v=2I65k-hVRJ8&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=12",
        "https://www.youtube.com/watch?v=LGySKsbqbik&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=15",
        "https://www.youtube.com/watch?v=ZnCMLyN4gQ4&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=16",
        "https://www.youtube.com/watch?v=665La2ZY7pA&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=17",
        "https://www.youtube.com/watch?v=U-iHnbPb60Y&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=20",
      ]),
      buildGroup("teasers_2", [
        "https://www.youtube.com/watch?v=JxbiHhRdlm4&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=22",
        "https://www.youtube.com/watch?v=SURVFysCQus&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=24",
        "https://www.youtube.com/watch?v=5OXetSj_FMU&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=28",
        "https://www.youtube.com/watch?v=pUypls1WgCg&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=29",
        "https://www.youtube.com/watch?v=HBKa9qatMHU&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=30",
        "https://www.youtube.com/watch?v=6ME_NLjnXYM&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=31",
        "https://www.youtube.com/watch?v=y7eqTMA_BMc&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=37",
        "https://www.youtube.com/watch?v=p7NbG2wqA38",
      ]),
      buildGroup("other_0", [
        "https://www.youtube.com/watch?v=-yM1TbN5_A8&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=32",
        "https://www.youtube.com/watch?v=mQzvCOKLiX8&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=45",
        "https://www.youtube.com/watch?v=cY4NEyitfdw&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=62",
        "https://www.youtube.com/watch?v=aYTeoqe0cNU&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=74",
        "https://www.youtube.com/watch?v=tpi5qsXm_cM&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=79",
        "https://www.youtube.com/watch?v=RPkHu8M_U4c&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=92",
        "https://www.youtube.com/watch?v=hCVA_0vRisw&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=94",
      ]),
      buildGroup("hoa_ep_7", [
        "https://www.youtube.com/watch?v=yVMckBB66-w&list=PLniTzKxa2c_dV_oGIbz45E8f5KnD9hMaB&index=14",
        "https://www.youtube.com/watch?v=S9FsrV72wGY&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=5",
        "https://www.youtube.com/watch?v=xNN7iTA57jM&list=PLniTzKxa2c_dMPngp56B6OKeMrDiz0Mt0&index=2",
        "https://www.youtube.com/watch?v=IvjMgVS6kng",
        "https://www.youtube.com/watch?v=2ya2drfb4rA&t=76s",
        "https://www.youtube.com/watch?v=65TV8jhp9Ns&t=67s",
        "https://www.youtube.com/watch?v=wF7zy5FANz4&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=43",
        "https://www.youtube.com/watch?v=6VHi08a65Eg&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=15",
        "https://www.youtube.com/watch?v=_YpKEpF0oxo&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=23",
        "https://www.youtube.com/watch?v=ZXXGpziGgs4&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=48",
        "https://www.youtube.com/watch?v=EcLZE4KVc_E&list=PLniTzKxa2c_fogTSXZK1gAWtVbv7P51LI&index=88",
        "https://www.youtube.com/watch?v=KpV9igkB_Kw&list=PLniTzKxa2c_drhk_HxO2dfHz6EyPJzUvi&index=3",
        "https://www.youtube.com/watch?v=azoIyy-n42k&list=PLniTzKxa2c_fw0bldtN6zJVRdXGNcqlt6&index=29",
      ]),
      buildGroup("hoa_ep_9", [
        "https://www.youtube.com/watch?v=juMabblyLZU&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=26",
        "https://www.youtube.com/watch?v=bFIee-C1KoA",
        "https://www.youtube.com/watch?v=5wpPNUZ5YbM",
        "https://www.youtube.com/watch?v=3Maap25ma0o&list=PL5bfv4BZ0SpehK7Kzija7ahXuPeVzvH2g&index=4",
        "https://www.youtube.com/watch?v=kmUueaXyio8",
        "https://www.youtube.com/watch?v=sAiXBI6LGTc",
        "https://www.youtube.com/watch?v=-cTt2jCUBwA",
        "https://www.youtube.com/watch?v=WahaiTaVw2k",
        "https://www.youtube.com/watch?v=9GfNlO0tBXk",
        "https://www.youtube.com/watch?v=tBI63CPbW9c",
        "https://www.youtube.com/watch?v=5TeUMQ37m0g",
        "https://www.youtube.com/watch?v=ofRMvTxQCHI&list=LL",
        "https://www.youtube.com/watch?v=d3xdEDqqiXc&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=37",
      ]),
      buildGroup("hoa_ep_11", [
        "https://www.youtube.com/watch?v=kArgjNWRo68&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=48",
        "https://www.youtube.com/watch?v=2wyCWmhDbFc",
        "https://www.youtube.com/watch?v=gVKEM4K8J8A&list=PLniTzKxa2c_fw0bldtN6zJVRdXGNcqlt6&index=18",
        "https://www.youtube.com/watch?v=vZWPgSVCeUM&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=2",
        "https://www.youtube.com/watch?v=CY97XoaEjFg&list=PLniTzKxa2c_dxZoQ_0L5kDpIChdiJnCR9&index=8",
        "https://www.youtube.com/watch?v=oCxuFF_hwhA",
        "https://www.youtube.com/watch?v=duBoHX2P2Z0",
        "https://www.youtube.com/watch?v=KU5EzBErrZ4&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=39",
        "https://www.youtube.com/watch?v=ZOKgx-ssJb4&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=51",
        "https://www.youtube.com/watch?v=I0n7DbaEMX0&list=PLniTzKxa2c_drhk_HxO2dfHz6EyPJzUvi&index=12",
        "https://www.youtube.com/watch?v=juMabblyLZU&list=PLniTzKxa2c_cIgV0Kxf7irM5o2enyZ63W&index=26",
      ]),
    ],
    settings: [],
  };

  const savedData = localStorage.getItem("taletunes_data");

  if (saveData) {
    let parsedData = JSON.parse(savedData);
    if (parsedData.groups) {
      if (parsedData.groups.length !== 0) {
        // sort parsedData for alphabetic order

        let sorted = parsedData.groups.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        // splice tunes marked deleted
        sorted.forEach((g, groupIndex) => {
          for (let i = g.tunes.length - 1; i >= 0; i--) {
            if (g.tunes[i].deleted) {
              g.tunes.splice(i, 1);
              saveData();
            }
          }
        });
        data.groups = sorted;
        data.settings = sorted.settings;
        data.groups.forEach((g) => addGroup(g.name));
        data.groups.forEach((g) => (g.active = false));
        useDefault = false;
      }
    }
  }

  return testData;
}

function buildGroup(name, urls = []) {
  let urls_unique = [...new Set(urls)];
  let group = new Group(name);
  group.active = false;
  urls_unique.forEach((url) => {
    group.tunes.push(new Tune(url));
  });
  return group;
}

function getRandomInt(min = 5, max = 7) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function useDefaultData() {
  // use the default data or test data
  console.log("--- no saved data --- loading default ---");
  data.groups = testData().groups;
  data.settings = testData().settings;
  data.groups.forEach((element) => addGroup(element.name));
}

/*
function buildTestGroup(array, n, name) {
  let urls = getRandomElements(array, n);
  let urls_unique = [...new Set(urls)];
  let group = new Group(name);
  group.active = false;

  urls_unique.forEach((url) => {
    group.tunes.push(new Tune(url));
  });
  return group;
}
*/

function checkForSavedData() {
  // load saved data
  console.log("--- checking for saved data ---");
  let savedData = localStorage.getItem("taletunes_data");

  let useDefault = true;

  if (savedData) {
    let parsedData = JSON.parse(savedData);
    if (parsedData.groups) {
      if (parsedData.groups.length !== 0) {
        // sort parsedData for alphabetic order

        let sorted = parsedData.groups.sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        // splice tunes marked deleted
        sorted.forEach((g, groupIndex) => {
          for (let i = g.tunes.length - 1; i >= 0; i--) {
            if (g.tunes[i].deleted) {
              g.tunes.splice(i, 1);
              saveData();
            }
          }
        });
        data.groups = sorted;
        data.settings = parsedData.settings;
        sorted.forEach((g) => addGroup(g.name));
        useDefault = false;
      }
    }
  }

  if (useDefault != false) {
    useDefaultData();
  }
}

function downloadBackup() {
  const savedData = localStorage.getItem("taletunes_data");
  if (!savedData) {
    alert("No data to back up!");
    return;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;

  const filename = `taletunes_backup_${timestamp}.json`;

  const blob = new Blob([savedData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) {
    alert("No file selected!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const json = JSON.parse(e.target.result);
      // Optional: validate json structure here
      localStorage.setItem("taletunes_data", JSON.stringify(json));
      alert("Backup imported successfully! Please reload the page.");
      checkForSavedData();
    } catch (err) {
      alert("Invalid backup file!");
      console.error(err);
    }
  };
  reader.readAsText(file);
}

function onYouTubeIframeAPIReady(event) {
  console.log("--- iframe api ready ---");
  checkForSavedData();
}

function saveData() {
  localStorage.setItem("taletunes_data", JSON.stringify(data));
  console.log("--- saved data ---");
}

function getGroupObjectByName(groupName) {
  return data.groups.find((group) => group.name === groupName);
}

function toggleGroupActive(btn) {
  let matchingNameGroup = data.groups.filter(
    (obj) => obj.name === btn.innerHTML
  );
  let group = matchingNameGroup[0];

  btn.classList.toggle("active");
  if (btn.classList.contains("active")) {
    showGroupElement(group.name);
  } else {
    hideGroupElement(group.name);
  }
  saveData();
}

function hideGroupElement(groupName) {
  let groupElement = document.getElementById(groupName);

  let groupObject = getGroupObjectByName(groupName);
  groupObject.active = false;
  if (groupElement) {
    hiddenGroupObject = getGroupObjectByName(groupName);

    hiddenGroupObject.tunes.forEach((tune) => {
      tune.stepSize = 0.4; // fade out delay // refactor when final fading function
      tune.fadeTargetVolume = 0;
    });
    groupElement.remove();
  }
}

function removeGroupsIframes(groupname) {
  // kill all iframes of this group
  let iframes = Array.from(document.getElementsByClassName("iframe"));
  iframes.forEach((iframe) => {
    if (iframe.id.includes(groupName)) {
      iframe.remove();
    }
  });
  console.log(`--- group ${groupName} iframes deleted!? ---`);
}

function deleteGroup(groupName) {
  // deletes displayed group element, toggle button, iframe
  hideGroupElement(groupName);
  for (let i = data.groups.length - 1; i >= 0; i--) {
    if (data.groups[i].name === groupName) {
      data.groups.splice(i, 1);
    }
  }
  let toggleButtons = document.getElementsByClassName("group-toggle-btn");
  for (let j = toggleButtons.length - 1; j >= 0; j--) {
    if (toggleButtons[j].innerHTML === groupName) {
      toggleButtons[j].remove();
    }
  }

  let iframes = Array.from(
    document.getElementById("iframe-container").children
  );
  iframes.forEach((pif) => {
    if (pif.id.includes(groupName)) {
      pif.remove();
    }
  });
  saveData();
}

function deleteEachGroup() {
  for (let i = data.groups.length - 1; i >= 0; i--) {
    deleteGroup(data.groups[i].name);
  }
  let savedData = localStorage.getItem("taletunes_data");
  let parsedData = JSON.parse(savedData);
}

function showAddGroupPopUp() {
  // show add group pop up
  let popUpInput = document.getElementById("pop-up-input");

  // focus pop-up-input "did not focus without the delay"
  setTimeout(function () {
    document.getElementById("pop-up-input").focus();
  }, 20);

  // add eventlistener to catch enter-key-up for pop-up-windows(s)
  popUpInput.addEventListener("keydown", handleEnterKey);

  // disable scrolling
  document.body.classList.add("no-scroll");

  let popUpBg = document.getElementById("pop-up-bg");
  popUpBg.style.display = "flex";

  let popUp = document.getElementsByClassName("pop-up-outer");
  popUp[0].style.display = "flex";
}

function showAddVideoURLPopUp(groupName) {
  // show add group pop up
  let popUpAddBtn = document.getElementById("pop-up-btn-video");
  let popUpInput = document.getElementById("pop-up-input-video");
  // focus pop-up-input "did not focus without the delay"
  setTimeout(function () {
    popUpInput.focus();
  }, 20);

  let clickAddVideoHandler = function (event) {
    let url = popUpInput.value;
    addTuneToGroup(groupName, url);
    hidePopUp();
    document
      .getElementById("pop-up-btn-video")
      .removeEventListener("click", clickAddVideoHandler);
  };

  let keyDownHandler = function (event) {
    if (event.keyCode === 13) {
      let url = popUpInput.value;
      addTuneToGroup(groupName, url);

      hidePopUp();
      document
        .getElementById("pop-up-input-video")
        .removeEventListener("keydown", keyDownHandler);
    }
  };
  // add eventlistener to catch click on ADD-URL-Button for pop-up-window
  popUpAddBtn.addEventListener("click", clickAddVideoHandler);

  // add eventlistener to catch enter-key-up for pop-up-window
  popUpInput.addEventListener("keydown", keyDownHandler);

  // disable scrolling
  document.body.classList.add("no-scroll");

  let popUpBg = document.getElementById("pop-up-bg");
  popUpBg.style.display = "flex";

  let popUp = document.getElementsByClassName("pop-up-outer-video");
  popUp[0].style.display = "flex";
}

function hidePopUp() {
  // hide pop up
  document.getElementById("pop-up-input").value = "";
  document.getElementById("pop-up-input-video").value = "";
  document.body.classList.remove("no-scroll");

  popUpBg = document.getElementById("pop-up-bg");
  popUpBg.style.display = "none";

  popUp = document.getElementsByClassName("pop-up-outer");
  popUp[0].style.display = "none";
  popUp = document.getElementsByClassName("pop-up-outer-video");
  popUp[0].style.display = "none";
}

function handleEnterKey(event) {
  // handle enter-key keyup for active pop-up
  if (event.keyCode === 13) {
    addGroup();
    hidePopUp();
    // remove the event listener after enter key is pressed
    document
      .getElementById("pop-up-input")
      .removeEventListener("keydown", handleEnterKey);
  }
}

function handleEnterKeyVideo(groupName, event) {
  // handle enter-key keyup for active pop-up
  if (event.keyCode === 13) {
    let url = document.getElementById("pop-up-input-video").value;

    // add tune
    addTuneToGroup(groupName, url);
    hidePopUp();

    // remove the event listener after enter key is pressed
    document
      .getElementById("pop-up-input-video")
      .removeEventListener("keydown", keyDownHandler); // this ahs no effecti think
  }
}

function replaceSpecialCharacters(str) {
  // Function to replace special characters in a string
  const charMap = {
    ä: "ae",
    ö: "oe",
    ü: "ue",
    ß: "ss",
    Ä: "Ae",
    Ö: "Oe",
    Ü: "Ue",
    é: "e",
    è: "e",
    ê: "e",
    à: "a",
    ç: "c",
    ñ: "n",
    // Add other mappings as needed
  };
  return str
    .split("")
    .map((char) => charMap[char] || char)
    .join("");
}

function addGroup(groupName = document.getElementById("pop-up-input").value) {
  groupName = groupName.replace(/\s+/g, "_");
  groupName = groupName.replace(/\s+/g, "_");
  groupName = replaceSpecialCharacters(groupName);

  let groupToggleBtns = document.getElementsByClassName("group-toggle-btn");
  let nameExistsInContainer = Array.from(groupToggleBtns)
    .map((btn) => btn.innerHTML)
    .includes(groupName);

  // checks group name availability
  if (
    !nameExistsInContainer &&
    !groupName.includes("&") &&
    groupName !== "" &&
    groupName !== "all" &&
    groupName.length > 0
  ) {
    // build group-toggle-button
    let newGroupToggleBtn = document.createElement("div");
    newGroupToggleBtn.innerHTML = groupName;
    newGroupToggleBtn.classList.add("group-toggle-btn");
    newGroupToggleBtn.addEventListener("click", function () {
      toggleGroupActive(this);
    });
    document
      .getElementById("group-toggle-btn-row")
      .appendChild(newGroupToggleBtn);

    // create data entry object if none exists
    let groupDataExists = data.groups
      .map((group) => group.name)
      .includes(groupName);
    if (!groupDataExists) {
      let group = new Group(groupName);
      data.groups.push(group);
    }
    // update groupToggleBtns in case a new groupToggleBtn was build
    groupToggleBtns = document.getElementsByClassName("group-toggle-btn");

    // if group.active attribute true add .active (css class)
    let addedGroupToggleBtn = groupToggleBtns[groupToggleBtns.length - 1];
    data.groups.forEach((group) => {
      if (group.name === addedGroupToggleBtn.innerHTML && group.active) {
        addedGroupToggleBtn.classList.add("active");
        showGroupElement(groupName);
      }
    });

    saveData();
    hidePopUp();
  }
}

function getVideoIDByUrl(url) {
  let regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  let match = url.match(regExp);
  return match && match[7].length == 11 ? match[7] : false;
}

function setBackgroundToThumbnail(elem, url) {
  console.log(" ---");
  console.log(" setBackgroundToThumbnail CALLED");
  console.log(" ---");

  let videoId = getVideoIDByUrl(url);
  if (videoId && elem) {
    elem.style.backgroundImage =
      "url(https://img.youtube.com/vi/" + videoId + "/0.jpg)";
  } else {
    if (videoId && elem) {
      console.error("Ungültige YouTube-URL:", url);
      elem.classList.add("defective");
      elem.innerHTML = url + " is no valid url";
    } else {
      console.log(" setBackgroundToThumbnail CALLED but FAILED!=!§$(%&");
    }
  }
}

function showYouTubeThumbnail(videoId) {
  // DEBUG TO CHECK IF APP IS THUMBNAILS LOCKED BY YT?!

  console.log("SHOW TM FUNCTION CALL");

  // Create an img element
  const img = document.createElement("img");

  // Set the image source to the YouTube thumbnail URL
  img.src = `https://img.youtube.com/vi/${videoId}/0.jpg`;

  // Set optional styles for better display
  img.style.maxWidth = "100%";
  img.style.border = "2px solid #000";
  img.style.borderRadius = "8px";

  // Append the image to the body or a specific container
  document.body.appendChild(img);
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    // Exit fullscreen mode
    document.exitFullscreen();
  } else {
    // Enter fullscreen mode
    document.documentElement.requestFullscreen().catch((err) => {
      console.error("Failed to enter fullscreen mode:", err);
    });
  }
}

function logTabActivity() {
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
      console.log(new Date() + "--- app is active tab ---");
    } else {
      console.log(new Date() + "--- app is inactive tab ---");
    }
  });
}

function initPlayer(groupName, url) {
  if (url !== "" && getVideoIDByUrl(url)) {
    let iframes = Array.from(document.getElementsByClassName("player-iframe"));

    console.log(iframes);

    if (!getPlayerByGroupNameAndUrl(groupName, url)) {
      // DEBUG debug

      //alert("in if block dshfadsöhgdjksgehjk");

      let newIframe = document.createElement("div");
      let iframeContainer = document.getElementById("iframe-container");

      let gName = groupName.replace(/\s+/g, "_");

      newIframe.id = encodeURIComponent(
        String(gName) + "_" + getVideoIDByUrl(url)
      );
      newIframe.classList.add("player-iframe");
      iframeContainer.appendChild(newIframe);

      // this should be a separate function
      let player = new YT.Player(newIframe.id, {
        startSeconds: "0",
        width: "500px",
        height: "500px",
        videoId: getVideoIDByUrl(url),
        allow: "autoplay",
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onPlaybackQualityChange: onPlayerPlaybackQualityChange,
          onError: onPlayerError,
        },
      });
      data.players.push(player);
      let tune = getTuneByPlayer(player);
      tune.player = player;
      try {
        tune.trackControllerInfoBar.innerHTML = player.videoTitle;
        tune.title = player.videoTitle;
      } catch {
        console.log(
          "--- tune.trackControllerInfoBar.innerHTML = player.videoTitle --- FAILEd "
        );
      }
    }
  }
}

function onPlayerReady(event) {
  event.target.setVolume(0);

  console.log("-------------", event.target);
}

function onPlayerStateChange(event) {
  let states = [
    "nicht gestartet",
    "beendet",
    "wird wiedergegeben",
    "pausiert",
    "wird gepuffert",
    "Video positioniert",
  ];
  console.log(
    "--- player state changed --- [ " +
      event.data +
      " : " +
      states[event.data + 1] +
      " ] "
  );
}

function onPlayerPlaybackQualityChange(event) {
  console.log("--- player playback quality changed ---");
}

function onPlayerError(event) {
  console.log("--- player error ---");
}
/*
function getPlayerByGroupNameAndUrl(groupName, url) {
  let player = data.players.find(
    (p) => p.g.id === groupName + "_" + getVideoIDByUrl(url)
  );
  if (player) {
    return player;
  }
}
*/

function getPlayerByGroupNameAndUrl(groupName, url) {
  let videoID = getVideoIDByUrl(url);

  for (let i = data.players.length - 1; i >= 0; i--) {
    if (data.players[i].g.id === groupName + "_" + videoID) {
      return data.players[i]; // Return the first match found from the end
    }
  }

  return null; // Return null if no match is found
}

function mapSpeed(value) {
  if (value <= 20) return "very fast";
  if (value <= 40) return "fast";
  if (value <= 60) return "normal";
  if (value <= 80) return "moderate";
  return "slow";
}

function showGroupElement(groupName) {
  let groupElement = document.createElement("div");
  groupElement.id = groupName;
  groupElement.classList.add("group-element");

  let groupHeader = document.createElement("div");
  groupHeader.classList.add("group-header");
  groupElement.appendChild(groupHeader);

  let groupNameElement = document.createElement("div");
  groupNameElement.classList.add("group-name");
  groupHeader.appendChild(groupNameElement);
  groupNameElement.innerHTML = groupName;
  groupNameElement.addEventListener("click", function () {
    hideGroupElement(groupName);
    Array.from(document.getElementsByClassName("group-toggle-btn")).forEach(
      (toggleBtn) => {
        if (toggleBtn.innerHTML === groupName) {
          toggleGroupActive(toggleBtn);
        }
      }
    );
  });

  let groupButtonAddURL = document.createElement("div");
  groupButtonAddURL.classList.add("group-btn");
  groupHeader.appendChild(groupButtonAddURL);
  groupButtonAddURL.innerHTML = "[ add tune ]";

  groupButtonAddURL.addEventListener("click", function () {
    showAddVideoURLPopUp(groupName);
  });

  let groupButtonDeleteGroup = document.createElement("div");
  groupButtonDeleteGroup.classList.add("group-btn");
  groupHeader.appendChild(groupButtonDeleteGroup);
  groupButtonDeleteGroup.innerHTML = "[ delete group ]";
  groupButtonDeleteGroup.addEventListener("click", function () {
    deleteGroup(groupName);
  });

  let trackControllerGroup = document.createElement("div");
  trackControllerGroup.classList.add("track-controller-group");
  groupElement.appendChild(trackControllerGroup);

  let groupEmptyMessage = document.createElement("div");
  groupEmptyMessage.classList.add("group-empty-msg");
  groupEmptyMessage.innerHTML = "empty group";

  trackControllerGroup.appendChild(groupEmptyMessage);

  document.getElementById("right").appendChild(groupElement);

  let groupObject = getGroupObjectByName(groupName);

  groupObject.active = true;

  for (let i = 0; i < groupObject.tunes.length; i++) {
    // only add tune if not deleted
    if (groupObject.tunes[i].deleted == false) {
      let trackController = document.createElement("div");

      // set trackController HTML element of this tune
      groupObject.tunes[i].trackController = trackController;
      trackController.classList.add("track-controller");

      setBackgroundToThumbnail(trackController, groupObject.tunes[i].url);

      // add volumeBar
      let volumeBar = document.createElement("div");
      volumeBar.classList.add("volume-bar");
      trackController.appendChild(volumeBar);
      groupObject.tunes[i].volumeBar = volumeBar;
      // add trackControllerInfoBar
      let trackControllerInfoBar = document.createElement("div");
      trackControllerInfoBar.classList.add("track-controller-info-bar");

      volumeBar.appendChild(trackControllerInfoBar);
      groupObject.tunes[i].trackControllerInfoBar = trackControllerInfoBar;

      let trackControllerGroups = groupElement.getElementsByClassName(
        "track-controller-group"
      );
      trackControllerGroups[0].appendChild(trackController);

      // init the YT iframe player and set corresponding tune.player key
      groupObject.tunes[i].player = initPlayer(
        groupName,
        groupObject.tunes[i].url
      );

      // set thumbnail
      //setBackgroundToThumbnail(trackController, groupObject.tunes[i].url);

      // An IIFE (Immediately Invoked Function Expression)
      // is a JavaScript function that runs as soon as it is defined.
      // (to ensure correct url event-listeners correspondence)

      (function (index, event) {
        // add onclick function to corresponding player, trackcontroller, ...
        trackController.addEventListener("mousemove", function (event) {
          curser_coords = getRelativeCurserPosition(event);

          trackControllerInfoBar = groupObject.tunes[i].trackControllerInfoBar;
          if (curser_coords[0] < 11) {
            trackControllerInfoBar.innerHTML = "[" + curser_coords[1] + "%]";
          } else {
            trackControllerInfoBar.innerHTML =
              "[" + curser_coords[1] + "% " + mapSpeed(curser_coords[0]) + "]";
          }
        });

        trackController.addEventListener("mouseleave", function (event) {
          //trackControllerInfoBar.innerHTML = "";
          trackControllerInfoBar.innerHTML = groupObject.tunes[i].title;
          console.log(
            groupObject.tunes[i].title,
            "----------------------------- debug"
          );
        });

        trackController.addEventListener("click", function (event) {
          curser_coords = getRelativeCurserPosition(event);

          let stepSize = (115 - curser_coords[0]) / 50.0;
          if (stepSize > 2.0) {
            stepSize = "set";
          } else {
            stepSize = (115 - curser_coords[0]) / 50.0;
          }
          groupObject.tunes[i].stepSize = stepSize;
          groupObject.tunes[i].fadeTargetVolume = curser_coords[1];

          let player = getPlayerByGroupNameAndUrl(
            groupName,
            groupObject.tunes[index].url
          );
          if (player) {
            //alert(player, "<---")
            player.playVideo();
          }
        });

        let deleteIcon = document.createElement("div");
        deleteIcon.classList.add("delete-tune");
        deleteIcon.innerHTML = "x";
        trackController.appendChild(deleteIcon);
        deleteIcon.addEventListener("click", function (event) {
          event.stopPropagation(); // Verhindert das "Event-Bubbling"
          trackController.remove();

          // remove player
          let player = getPlayerByGroupNameAndUrl(
            groupName,
            groupObject.tunes[index].url
          );

          let p_index = data.players.indexOf(player);
          data.players.splice(p_index, 1);

          let iframeID =
            groupName + "_" + getVideoIDByUrl(groupObject.tunes[index].url);

          // remove player iframe
          Array.from(document.getElementsByClassName("player-iframe")).forEach(
            (pif) => {
              pifID = groupName + "_" + getVideoIDByUrl(iframeID);
              if (pif.id === pifID) {
                pif.remove();
              }
            }
          );
          if (document.getElementById(iframeID)) {
            document.getElementById(iframeID).remove();
          }
          // mark tune from groupObject to be spliced when loading
          // to prevent indexing issues
          groupObject.tunes[i].deleted = true;
        });

        let copyUrlIconToClipBoard = document.createElement("div");
        copyUrlIconToClipBoard.classList.add("copy-url");
        copyUrlIconToClipBoard.innerHTML = "copy url";
        trackController.appendChild(copyUrlIconToClipBoard);
        copyUrlIconToClipBoard.addEventListener("click", function (event) {
          event.stopPropagation(); // Verhindert das Event-Bubbling
          copyToClipboard(groupObject.tunes[i].url);
          console.log("--- tune url copied to clipboard ---");
        });
      })(i);
    }
  }

  // scroll smooth to bottom page (newest active group)
  window.scroll({
    top: document.body.scrollHeight,
    left: 0,
    /*behavior: "smooth",*/
  });
}

function assignPastelColors() {
  const elements = document.querySelectorAll(".group-toggle-btn");

  elements.forEach((el) => {
    const text = el.innerHTML;
    const hash = stringToHash(text);
    const color = hashToPastelColor(hash);

    el.style.backgroundColor = color; // Always set background color
    if (el.classList.contains("active")) {
      el.style.color = "var(--titles)";
    } else {
      el.style.color = hashToPastelColorLight(hash);
    }
  });
}

// Convert a string to a hash value
function stringToHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

// Convert hash to a pastel HSL color
function hashToPastelColor(hash) {
  const hue = Math.abs(hash) % 360; // Ensure hue is within 0-360
  const saturation = 40; // Keep colors vibrant
  const lightness = 50; // Pastel effect

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Convert hash to a pastel HSL color
function hashToPastelColorLight(hash) {
  const hue = Math.abs(hash) % 360; // Ensure hue is within 0-360
  const saturation = 40; // Keep colors vibrant
  const lightness = 80; // Pastel effect

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function update() {
  //saveData(); // this caused overwriting localstorage and loading default (cntrl + f5)
  updateEditElements();
  killPlayerIfGroupNotActive();
  assignPastelColors();

  data.groups.forEach((group) => {
    group.tunes.forEach((tune) => {
      let player = getPlayerByGroupNameAndUrl(group.name, tune.url);

      try {
        if (player && player.getPlayerState() == 1 && tune.stepSize !== "set") {
          if (
            tune.stepSize >= Math.abs(tune.fadeTargetVolume - tune.isVolume)
          ) {
            tune.isVolume = tune.fadeTargetVolume;
          }
          if (tune.isVolume > tune.fadeTargetVolume) {
            //console.log("isVolume--");
            tune.isVolume -= tune.stepSize;
          }
          if (tune.isVolume < tune.fadeTargetVolume) {
            //console.log("isVolume++");
            tune.isVolume += tune.stepSize;
          }
          if (tune.fadeTargetVolume > 90) {
            tune.fadeTargetVolume = 100;
          }
          if (tune.fadeTargetVolume < 10) {
            tune.fadeTargetVolume = 0;
          }
          if (tune.isVolume <= 0) {
            player.stopVideo();
            console.log("--- STOPPED ---");
            tune.fadeTargetVolume = -1;
            if ((tune.fadeTargetVolume = 0)) {
              tune.isVolume = 0;
            }
          }
          if (tune.isVolume >= 100) {
            tune.isVolume = 100;
          }
        }
        // playing or not adjust
        if (player) {
          if (tune.stepSize === "set") {
            tune.isVolume = tune.fadeTargetVolume;
            tune.stepSize = 100;
          }
          player.setVolume(tune.isVolume);
          // adjust volumeBar height
          if (tune.volumeBar) {
            tune.volumeBar.style.height = String(100 - tune.isVolume) + "%";
          }
          if (tune.isVolume <= 0) {
            tune.isVolume = 0;
          }
        }
        // set videoTitles
        if (player && tune.trackControllerInfoBar.innerHTML == "") {
          tune.trackControllerInfoBar.innerHTML = getPlayerByGroupNameAndUrl(
            group.name,
            tune.url
          ).videoTitle;
        }

        //console.log("UPDATE - OK!");
      } catch (error) {
        //console.log("UPDATE - FAILED!");
      }
    });
  });
}

function getRelativeCurserPosition(event) {
  var rect = event.target.getBoundingClientRect();
  width = rect.right - rect.left;

  // x position within the element.
  var x = Math.floor(((event.clientX - rect.left) / width) * 100);
  // y position within the element.
  var y = 100 - Math.floor(((event.clientY - rect.top) / width) * 100);

  margin = 10;

  if (x > 100 - margin) {
    x = 100;
  }
  if (x < margin) {
    x = 0;
  }

  if (y < margin) {
    y = 0;
  }
  if (y > 100 - margin) {
    y = 100;
  }

  coords = [x, y];
  return coords;
}

function getRandomElements(array, n) {
  if (!Array.isArray(array)) {
    throw new TypeError("The first argument must be an array");
  }
  if (typeof n !== "number" || n < 0 || n > array.length) {
    throw new TypeError(
      "The second argument must be a non-negative number less than or equal to the length of the array"
    );
  }

  // Create a copy of the array to avoid modifying the original array
  const arrayCopy = array.slice();

  // Fisher-Yates shuffle algorithm
  for (let i = arrayCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
  }

  // Return the first n elements from the shuffled array
  return arrayCopy.slice(0, n);
}

function getTuneByPlayer(player) {
  let tune = null;
  data.groups.forEach((g) => {
    g.tunes.forEach((t) => {
      if (player.g.id.includes(getVideoIDByUrl(t.url))) {
        tune = t;
      }
    });
  });
  return tune;
}

function addTuneToGroup(groupName, url) {
  // prevent tune duplicates with same url
  if (!getPlayerByGroupNameAndUrl(groupName, url)) {
    if (url !== "") {
      if (getVideoIDByUrl(url)) {
        let groupElement = document.getElementById(groupName);
        if (groupElement) {
          let trackController = document.createElement("div");
          let tune = new Tune(url);
          getGroupObjectByName(groupName).tunes.push(tune);
          tune.url = url;
          tune.deleted = false;

          // set trackController HTML element of this tune
          tune.trackController = trackController;

          trackController.classList.add("track-controller");

          let deleteIcon = document.createElement("div");
          deleteIcon.classList.add("delete-tune");
          updateEditElements();
          deleteIcon.innerHTML = "x";
          trackController.appendChild(deleteIcon);
          deleteIcon.addEventListener("click", function (event) {
            event.stopPropagation(); // Verhindert das Event-Bubbling
            trackController.remove();

            // remove player
            let player = getPlayerByGroupNameAndUrl(groupName, url);
            let p_index = data.players.indexOf(player);
            data.players.splice(p_index, 1);
            // remove player iframe
            Array.from(
              document.getElementsByClassName("player-iframe")
            ).forEach((pif) => {
              pifID = groupName + "_" + getVideoIDByUrl(url);
              if (pif.id === pifID) {
                pif.remove();
              }
            });

            // mark tune from groupObject to be spliced when loading
            // to prevent indexing issues
            tune.deleted = true;
          });

          let copyUrlIconToClipBoard = document.createElement("div");
          copyUrlIconToClipBoard.classList.add("copy-url");
          copyUrlIconToClipBoard.innerHTML = "copy url";
          trackController.appendChild(copyUrlIconToClipBoard);
          copyUrlIconToClipBoard.addEventListener("click", function (event) {
            event.stopPropagation(); // Verhindert das Event-Bubbling
            copyToClipboard(url);
          });

          // add volumeBar
          let volumeBar = document.createElement("div");
          volumeBar.classList.add("volume-bar");
          trackController.appendChild(volumeBar);
          tune.volumeBar = volumeBar;
          // add trackControllerInfoBar
          let trackControllerInfoBar = document.createElement("div");
          trackControllerInfoBar.classList.add("track-controller-info-bar");

          tune.trackControllerInfoBar = trackControllerInfoBar;
          volumeBar.appendChild(trackControllerInfoBar);

          let trackControllerGroups = groupElement.getElementsByClassName(
            "track-controller-group"
          );
          trackControllerGroups[0].appendChild(trackController);

          // init the YT iframe player and set corresponding tune.player key
          tune.player = initPlayer(groupName, url);

          // set thumbnail
          setBackgroundToThumbnail(trackController, url);

          // An IIFE (Immediately Invoked Function Expression)
          // is a JavaScript function that runs as soon as it is defined.
          // (to ensure correct url event-listeners correspondence)

          // add onclick function to corresponding player
          trackController.addEventListener("mousemove", function (event) {
            curser_coords = getRelativeCurserPosition(event);

            trackControllerInfoBar = tune.trackControllerInfoBar;
            if (curser_coords[0] < 11) {
              trackControllerInfoBar.innerHTML = "[" + curser_coords[1] + "%]";
            } else {
              trackControllerInfoBar.innerHTML =
                "[" +
                curser_coords[1] +
                "% in " +
                "" +
                Math.floor(curser_coords[0]) +
                "s]";
            }
          });

          trackController.addEventListener("mouseleave", function () {
            trackControllerInfoBar.innerHTML = tune.player.videoTitle;
          });

          // new -
          trackController.addEventListener("click", function (event) {
            curser_coords = getRelativeCurserPosition(event);

            let stepSize = (115 - curser_coords[0]) / 50.0;
            if (stepSize > 2.0) {
              stepSize = "set";
            } else {
              stepSize = (115 - curser_coords[0]) / 50.0;
            }

            let groupObject = getGroupObjectByName(groupName);

            tune.stepSize = stepSize;
            tune.fadeTargetVolume = curser_coords[1];

            let player = getPlayerByGroupNameAndUrl(groupName, tune.url, tune);
            if (player) {
              player.playVideo();
            }
          });
        }
      }
    }
  }
  saveData();
}

function toggleEditMode() {
  if (data.mode === "edit") {
    data.mode = "play";
  } else {
    data.mode = "edit";
  }
  document.getElementById("mode-toggle").innerHMTL = data.mode;
}

function toggleTrackControllerSize() {
  const rootStyles = getComputedStyle(document.documentElement);
  if (rootStyles.getPropertyValue("--controller_width") === "200px") {
    document.documentElement.style.setProperty("--controller_width", "140px");
  } else {
    document.documentElement.style.setProperty("--controller_width", "200px");
  }
}

function updateEditElements() {
  if (data.mode !== "edit") {
    Array.from(document.getElementsByClassName("group-btn")).forEach((elem) => {
      elem.classList.remove("edit-mode");
    });

    Array.from(document.getElementsByClassName("delete-tune")).forEach(
      (elem) => {
        elem.classList.remove("edit-mode");
      }
    );

    Array.from(document.getElementsByClassName("copy-url")).forEach((elem) => {
      elem.classList.remove("edit-mode");
    });

    Array.from(document.getElementsByClassName("defective")).forEach((elem) => {
      elem.classList.remove("edit-mode");
    });

    if (document.getElementById("cancel-video")) {
      document.getElementById("cancel-video").classList.remove("edit-mode");
    }
    if (document.getElementById("new-group")) {
      document.getElementById("new-group").classList.remove("edit-mode");
    }
  } else {
    Array.from(document.getElementsByClassName("group-btn")).forEach((elem) => {
      elem.classList.add("edit-mode");
    });

    Array.from(document.getElementsByClassName("delete-tune")).forEach(
      (elem) => {
        elem.classList.add("edit-mode");
      }
    );

    Array.from(document.getElementsByClassName("copy-url")).forEach((elem) => {
      elem.classList.add("edit-mode");
    });

    Array.from(document.getElementsByClassName("defective")).forEach((elem) => {
      elem.classList.add("edit-mode");
    });

    // suboptimal way to sync elements classes to fix toggle issues for dynamically build elements

    if (document.getElementById("cancel-video")) {
      document.getElementById("cancel-video").classList.remove("edit-mode");
      document.getElementById("cancel-video").classList.add("edit-mode");
    }

    if (document.getElementById("new-group")) {
      document.getElementById("new-group").classList.remove("edit-mode");
      document.getElementById("new-group").classList.add("edit-mode");
    }

    Array.from(document.getElementsByClassName("copy-url")).forEach((elem) => {
      elem.classList.remove("edit-mode");
      elem.classList.add("edit-mode");
    });
  }
}

function toggleTitles() {
  Array.from(
    document.getElementsByClassName("track-controller-info-bar")
  ).forEach((tcib) => {
    tcib.classList.toggle("hidden-title");
  });
}

function copyToClipboard(text) {
  // Check if the Clipboard API is supported
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(function () {
        console.log("--- text copied to clipboard ---");
      })
      .catch(function (error) {
        console.error("--- failed to copy text: ", error, " ---");
      });
  } else {
    // Fallback for older browsers
    let textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      console.log("--- text copied to clipboard ---");
    } catch (error) {
      console.error("--- failed to copy text: ", error, " ---");
    }
    document.body.removeChild(textArea);
  }
}

function killPlayerIfGroupNotActive() {
  let iframes = Array.from(document.getElementsByClassName("player-iframe"));

  data.groups.forEach((g) => {
    if (g.active === false) {
      g.tunes.forEach((t) => {
        iframes.forEach((iframe) => {
          if (iframe.id === g.name + "_" + getVideoIDByUrl(t.url)) {
            t.killCounter++;

            if (t.killCounter > 260) {
              //iframe.remove();
              //console.log("--- iframe removed ---", t.url);
              //t.player = null;
              t.killCounter = 0;
            }
          }
        });
      });
    } else {
      g.tunes.forEach((t) => {
        t.killCounter = 0;
      });
    }
  });
}

function showPlayerIframes() {
  document.getElementById("iframe-container").classList.toggle("visible");
}

/*
--------------------------------------------------------------------------------------------------------------------------------------------------
*/

function loadYouTubeIframeAPI() {
  if (typeof YT == "undefined" || typeof YT.Player == "undefined") {
    var tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }
}
loadYouTubeIframeAPI();

// start worker for fading while tab inactive
if (window.Worker) {
  // Create a new Web Worker
  const worker = new Worker("volumeFadeWorker.js");

  // Handle messages received from the Web Worker
  worker.onmessage = update;

  // Optional: Handle errors
  worker.onerror = function (error) {
    console.error("Worker error:", error);
  };
} else {
  console.error("Your browser doesn't support Web Workers.");
}

// set tune volume to 0 beofre unload/refresh
window.onbeforeunload = function (event) {
  data.groups.forEach((g) => {
    g.active = false;
    g.tunes.forEach((t) => {
      t.isVolume = 0;
    });
  });
  saveData();
};

// center the view on the group-toggle-container at start
window.onload = function () {
  document
    .getElementById("group-toggle-container")
    .scrollIntoView({ behavior: "smooth", block: "center" });
  checkForSavedData();

  // debug - are the trackcontroller not loading the thumbnails now?
  //console.log("ON LOAD");
  //showYouTubeThumbnail("dQw4w9WgXcQ");
};

/*
--------------------------------------------------------------------------------------------------------------------------------------------------
*/
