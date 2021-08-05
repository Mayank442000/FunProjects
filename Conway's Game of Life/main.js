dc = document;
sz = 25;

function crtTbl(W, H) {
    let bd = gebi("bdy");
    let h = H ? H : Math.floor(bd.clientHeight / sz + 0.5),
        w = W ? W : Math.floor(bd.clientWidth / sz),
        i = 0,
        s = "",
        j;
    console.log(w, h);
    window.h = h;
    window.w = w;
    window.r = true;
    window.mat = [...Array(w)].map((e) => Array(h));
    window.alv = [];
    window.gen = 0;
    window.mxp = 0;
    window.lop = [0, 0, 0, 0, 0, 0];
    window.lopI = 0;
    window.sj = {};
    window.sim = 0;
    window.sInd = 0;
    window.nxGen = 0;
    console.log(mat);
    for (; i < h; ++i) {
        s += '<tr class="tr">';
        for (j = 0; j < w; ++j) {
            mat[j][i] = [false];
            s += '<td class="td" id="c' + i + "r" + j + '" onclick="tdClk(' + j + "," + i + ')"></td>';
        }
        s += "</tr>";
    }
    for (i = 0; i < w; ++i) {
        mat[i][-1] = mat[i][h - 1];
        mat[i][h] = mat[i][0];
    }
    mat[-1] = mat[w - 1];
    mat[w] = mat[0];
    gebi("tbl").innerHTML = s;
    gebi("Sz").innerText = "" + w + " x " + h;
}

function tdClk(i, j) {
    let c = gebi("c" + j + "r" + i);
    if (mat[i][j][0]) {
        alv.splice(alv.indexOf([i, j]), 1);
        mat[i][j][0] = 0;
        c.classList.remove("alv");
        return;
    }
    mat[i][j][0] = 1;
    alv.push([i, j]);
    c.classList.add("alv");
}

async function runTime() {
    sav(1);
    let i,
        l,
        arr = [],
        liv;
    while (r && alv.length) {
        updt(arr);
        if (sim && gen >= nxGen) await ldSim();
        arr = new Set();
        liv = alv.slice();
        for (i = 0; i < w; ++i) for (j = 0; j < h; ++j) chk(arr, i, j);
        l = arr.size;
        arr = Array.from(arr);
        for (i = 0; i < l; ++i) tdClk(arr[i][0], arr[i][1]);
        chkSt();
        await sleep(1000);
    }
    sav(0);
}

function sav() {
    let st = {
        matrix: ar2str(mat).replaceAll("false", 0).replaceAll("True", 1),
        loping: gebi("Lop").innerText,
        generation: gen,
        maxPop: mxp,
        time: new Date(),
    };
    //console.log(st);
    sj["state"].push(st);
}

async function chkSt() {
    let t = lop.indexOf(mat.toString()) != -1;
    if (t) {
        console.log(lop.indexOf(mat));
        updt([]);
        gen--;
        plPs();
    }
    lop[lopI++ % lop.length] = mat.toString();
}

function updt(ar) {
    mxp = Math.max(mxp, alv.length);
    gebi("Gen").innerText = gen++;
    gebi("Pop").innerText = alv.length;
    gebi("mxPop").innerText = mxp;
    gebi("Lop").innerText = lop.indexOf(mat.toString()) != -1;
    gebi("Upd").innerText = ar.length;
}

function ar2str(j) {
    let jsn = {};
    jsn["s"] = JSON.stringify(j);
    let s = JSON.stringify(jsn);
    return s.substr(6, s.length - 8);
}

function chk(arr, i, j) {
    //console.log(i, j, "\n", arr);
    c = mat[i][j][0];
    n = nhb(i, j);
    //console.log(c, n);
    if ((c && n != 2 && n != 3) || (!c && n == 3)) arr.add([i, j]);
}

function nhb(i, j) {
    return (
        mat[i - 1][j - 1][0] +
        mat[i][j - 1][0] +
        mat[i + 1][j - 1][0] +
        mat[i - 1][j][0] +
        mat[i + 1][j][0] +
        mat[i - 1][j + 1][0] +
        mat[i][j + 1][0] +
        mat[i + 1][j + 1][0]
    );
}

function sleep(ms) {
    return new Promise((rslv) => {
        setTimeout(() => rslv(), ms);
    });
}

function plPs() {
    let b = gebi("plPs");
    b.innerText = r ? "▶ Play" : "❚❚ Pause";
    r = !r;
    console.log("r", r);
    if (r) runTime();
}

function init(w, h) {
    crtTbl(w, h);
    sj["Size"] = "" + w + " x " + h;
    sj["date"] = "" + new Date();
    sj["state"] = [];
    plPs();
}

function gebi(id) {
    return dc.getElementById(id);
}

function dwn() {
    var textToSave = JSON.stringify(sj)
        .replaceAll('","loping"', ',"loping"')
        .replaceAll('"matrix":"', '"matrix":')
        .replaceAll("[0]", "0")
        .replaceAll("[1]", "1");
    console.log(textToSave);
    var hiddenElement = document.createElement("a");
    hiddenElement.href = "data:attachment/text," + encodeURI(textToSave);
    hiddenElement.target = "_blank";
    hiddenElement.download = "Conway's Game of Life.json";
    hiddenElement.click();
}

function upd(fl) {
    let reader = new FileReader();
    reader.readAsText(fl.files[0]);
    reader.onload = function () {
        flParse(reader.result);
    };
}

function flParse(s) {
    let jj = JSON.parse(s);
    let siz = [...jj["Size"].split(" x ")];
    nxGen = jj["state"][0]["generation"];
    init(siz[0] - 0, siz[1] - 0);
    window.sim = 1;
    window.jj = jj;
    console.log("siz : ", ...siz);
    ldSim();
}

async function ldSim() {
    let i = 0,
        j = 0;
    const bdy = gebi("bdy");
    console.log("loading Sim Generation");
    bdy.classList.add("org");
    if (gen >= jj["state"][sInd]["generation"]) {
        await sleep(690);
        for (; i < w; ++i)
            for (j = 0; j < h; ++j)
                if (jj["state"][sInd]["matrix"][i][j] != mat[i][j][0]) {
                    tdClk(i, j);
                    await sleep(69);
                }
        nxGen = jj["state"].length - 1 > sInd ? jj["state"][++sInd]["generation"] : Infinity;
    }
    await sleep(690);
    bdy.classList.remove("org");
    console.log("nxGen : ", nxGen, "\nsInd : ", sInd);
}
