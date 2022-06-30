// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "./_BASE.sol";

contract TH_NFT is Collection_BASE("Tony Han's Chinese Zodiac NFT", "TH_NFT", "Welcome to Asia")
{
    string[] private trigrams_64 =
    [
        unicode"乾 ䷀"
    ,   unicode"坤 ䷁"
    ,   unicode"屯 ䷂"
    ,   unicode"蒙 ䷃"
    ,   unicode"需 ䷄"
    ,   unicode"讼 ䷅"
    ,   unicode"师 ䷆"
    ,   unicode"比 ䷇"
    ,   unicode"小畜 ䷈"
    ,   unicode"履 ䷉"
    ,   unicode"泰 ䷊"
    ,   unicode"否 ䷋"
    ,   unicode"同人 ䷌"
    ,   unicode"大有 ䷍"
    ,   unicode"谦 ䷎"
    ,   unicode"豫 ䷏"
    ,   unicode"随 ䷐"
    ,   unicode"蛊 ䷑"
    ,   unicode"临 ䷒"
    ,   unicode"观 ䷓"
    ,   unicode"噬嗑 ䷔"
    ,   unicode"贲 ䷕"
    ,   unicode"剥 ䷖"
    ,   unicode"复 ䷗"
    ,   unicode"无妄 ䷘"
    ,   unicode"大畜 ䷙"
    ,   unicode"颐 ䷚"
    ,   unicode"大过 ䷛"
    ,   unicode"坎 ䷜"
    ,   unicode"离 ䷝"
    ,   unicode"咸   ䷞"
    ,   unicode"恒 ䷟"
    ,   unicode"遁 ䷠"
    ,   unicode"大壮 ䷡"
    ,   unicode"晋 ䷢"
    ,   unicode"明夷 ䷣"
    ,   unicode"家人 ䷤"
    ,   unicode"睽 ䷥"
    ,   unicode"蹇 ䷦"
    ,   unicode"解 ䷧"
    ,   unicode"损 ䷨"
    ,   unicode"益 ䷩"
    ,   unicode"夬 ䷪"
    ,   unicode"姤 ䷫"
    ,   unicode"萃 ䷬"
    ,   unicode"升 ䷭"
    ,   unicode"困 ䷮"
    ,   unicode"井 ䷯"
    ,   unicode"革 ䷰"
    ,   unicode"鼎 ䷱"
    ,   unicode"震 ䷲"
    ,   unicode"艮 ䷳"
    ,   unicode"渐 ䷴"
    ,   unicode"归妹 ䷵"
    ,   unicode"丰 ䷶"
    ,   unicode"旅 ䷷"
    ,   unicode"巽 ䷸"
    ,   unicode"兑 ䷹"
    ,   unicode"涣 ䷺"
    ,   unicode"节 ䷻"
    ,   unicode"中孚 ䷼"
    ,   unicode"小过 ䷽"
    ,   unicode"既济 ䷾"
    ,   unicode"未济 ䷿"
    ];

    string[] private elements_5 =
    [
        unicode"金"
    ,   unicode"木"
    ,   unicode"水"
    ,   unicode"火"
    ,   unicode"土"
    ];

    string[] private chinese_zodiac =
    [
        unicode"鼠"
    ,   unicode"牛"
    ,   unicode"虎"
    ,   unicode"兔"
    ,   unicode"龍"
    ,   unicode"蛇"
    ,   unicode"馬"
    ,   unicode"羊"
    ,   unicode"猴"
    ,   unicode"雞"
    ,   unicode"狗"
    ,   unicode"豬"
    ];

    function getImage(uint256 tokenId)
        internal view override
        returns (bytes memory)
    {
        return abi.encodePacked
        (
            '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 100 100">'

        ,   '<rect width="100" height="100" fill="gray" />'

        ,   '<text x="10" y="20" class="base">'
        ,   pluck(tokenId, "TRIGRAMS_64", trigrams_64)
        ,   '</text><text x="20" y="40" class="base">'
        ,   pluck(tokenId, "ELEMENTS_64", elements_5)
        ,   '</text><text x="20" y="60" class="base">'
        ,   pluck(tokenId, "CHINESE_ZODIAC_12", chinese_zodiac)
        ,   '</text>'

        ,   '</svg>'
        );
    }
}
