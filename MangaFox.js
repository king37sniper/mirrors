var MangaFox = {
    mirrorName: "Manga-Fox",
    canListFullMangas: false,
    mirrorIcon: "img/mangafox.png",
    languages: "en",
    isMe: function(url) {
        "use strict";
        return (url.indexOf("mangafox.la") !== -1);
    },
    getMangaList: function(search, callback) {
        "use strict";
        var urlManga = "http://mangafox.la/search.php?name=" + search +
            "&advopts=1";
        $.ajax({
            url: urlManga,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Cache-Control", "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success: function(objResponse) {
                var div = document.createElement("div");
                div.innerHTML = objResponse.replace(/<img/gi, '<noload');
                if (objResponse.indexOf("No Manga Series") !==
                    -1) {
                    callback("Manga-Fox", []);
                } else {
                    var res = [];
                    $("#listing tr td:first-child a", div).each(
                        function(index) {
                            res[index] = [$(this).html(),
                                $(this).attr("href")
                            ];
                        });
                    callback("Manga-Fox", res);
                }
            }
        });
    },
    getListChaps: function(urlManga, mangaName, obj, callback) {
        "use strict";
        $.ajax({
            url: urlManga + "?no_warning=1",
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Cache-Control",
                    "no-cache");
                xhr.setRequestHeader("Pragma", "no-cache");
            },
            success: function(objResponse) {
                var div = document.createElement("div");
                objResponse = objResponse.replace(/<img\b[^>]*>/ig, ''); //avoid loading cover image
                div.innerHTML = objResponse;
                var res = [];
                var mangaName = $('#title h2', div).text().substr(
                    5, $('#title h2', div).text().length -
                    18);
                $("ul.chlist h3, ul.chlist h4", div).each(
                    function(index) {
                        if ($('a', $(this)).attr("href")
                            .indexOf("/manga/") !== -1) {
                            var vol = $(this).parents(
                                    'ul.chlist').prev(
                                    'div.slide').children(
                                    'h3').contents(
                                    ':not(span)').text()
                                .trim().substr(7);
                            var tit = 'Vol ' + vol +
                                ' Ch ' + $('a', $(this))
                                .text().substr(
                                    mangaName.length +
                                    1) + ': ' + $(
                                    'span.title', $(
                                        this)).text();
                            var url = $('a', $(this)).attr(
                                "href");
                            var curChapURL = url.substr(
                                0, url.lastIndexOf(
                                    "/") + 1);
                            if (curChapURL.substr(
                                curChapURL.length -
                                2, 2) === "//") {
                                curChapURL = curChapURL
                                    .substr(0,
                                        curChapURL.length -
                                        1);
                            }
                            res[res.length] = [tit.trim(),
                                "http:" + curChapURL
                            ];
                        }
                    });
                callback(res, obj);
            }
        });
    },
    getInformationsFromCurrentPage: function (doc, curUrl, callback) {
        //This function runs in the DOM of the current consulted page.
        var name;
        var currentChapter;
        var currentMangaURL;
        var currentChapterURL;
        name = $($(".readpage_top .title a", doc)[1]).text().trim();
        if (name.length >= 5 && name.substr(name.length - 5, 5) == "Manga") {
            name = name.substr(0, name.length - 5).trim();
        }
        currentChapter = $($(".readpage_top .title a", doc)[0]).text();
        currentChapterURL = $(".readpage_top .title a", doc)[0].href;
        console.log(currentChapterURL);
        currentMangaURL = $(".readpage_top .title a", doc)[1].href;
        callback({
            "name": name,
            "currentChapter": currentChapter,
            "currentMangaURL": currentMangaURL,
            "currentChapterURL": currentChapterURL
        });
    },
    getListImages: function (doc, curUrl) {
        //This function runs in the DOM of the current consulted page.
        var res = [];
        $("select.wid60:first option", doc).each(function (index) {
            res[res.length] = $(this).val();
        });
        return res;
    },
    removeBanners: function(doc, curUrl) {
        "use strict";
        $("#bottom_ads", doc).remove();
        $('#MarketGid9463', doc).remove();
        $('.ad', doc).remove();
        $('#banner', doc).remove();
    },
    whereDoIWriteScans: function(doc, curUrl) {
        "use strict";
        return $("#viewer", doc);
    },
    whereDoIWriteNavigation: function(doc, curUrl) {
        "use strict";
        return $(".navAMR", doc);
    },
    isCurrentPageAChapterPage: function(doc, curUrl) {
        "use strict";
        if ($("#viewer", doc) !== null) {
            return ($("#viewer", doc).size() !== 0);
        }
        return false;
    },
    doSomethingBeforeWritingScans: function(doc, curUrl) {
        "use strict";
        $('#viewer', doc).css({
            'width': 'auto',
            'margin': 'auto',
            'background-color': 'black'
        });
        $("#image", doc).remove();
        $("#tool", doc).next().remove();
        $("#viewer", doc).after("<div class='navAMR'></div>").before(
            "<div class='navAMR'></div>");
        $(".widepage.page", doc).remove();
        $('.fb_iframe_widget', doc).remove();
        if (typeof doc.createElement === 'function') {
            var script = doc.createElement('script');
            script.innerText = "$(document).unbind('keydown');";
            doc.body.appendChild(script);
        }
    },
    nextChapterUrl: function(select, doc, curUrl) {
        "use strict";
        if ($(select).children("option:selected").prev().size() !== 0) {
            return $(select).children("option:selected").prev().val();
        }
        return null;
    },
    previousChapterUrl: function(select, doc, curUrl) {
        "use strict";
        if ($(select).children("option:selected").next().size() !== 0) {
            return $(select).children("option:selected").next().val();
        }
        return null;
    },
    getImageFromPageAndWrite: function(urlImg, image, doc, curUrl) {
        "use strict";
        $.ajax({
            url: urlImg,
            success: function(objResponse) {
                var src = $('#image', objResponse).attr('src');
                $(image).attr("src", src);
            },
            error: function() {
                $(image).attr("src", "");
            }
        });
    },
    isImageInOneCol: function(img, doc, curUrl) {
        "use strict";
        return false;
    },
    getMangaSelectFromPage: function(doc, curUrl) {
        "use strict";
        return null;
    },
    doAfterMangaLoaded: function(doc, curUrl) {
        "use strict";
        $("body > div:empty", doc).remove();
    }
};
// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
    registerMangaObject("Manga-Fox", MangaFox);
}
