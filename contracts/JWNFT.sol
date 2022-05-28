// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract JWNFT is ERC721("NFT_APlus", "Beaut NFTs by TH"), Ownable {
    uint256 public MAX_MINTABLE_TOKENS = 5;

    constructor (address _buyer)
    {
        for (uint i = 1; i <= MAX_MINTABLE_TOKENS; ++i) { _safeMint(_buyer, i); }

        // _safeMint(address(this), 21);
    }

    string[] private trigrams_64 = [
        unicode"乾 ䷀",
        unicode"坤 ䷁",
        unicode"屯 ䷂",
        unicode"蒙 ䷃",
        unicode"需 ䷄",
        unicode"讼 ䷅",
        unicode"师 ䷆",
        unicode"比 ䷇",
        unicode"小畜 ䷈",
        unicode"履 ䷉",
        unicode"泰 ䷊",
        unicode"否 ䷋",
        unicode"同人 ䷌",
        unicode"大有 ䷍",
        unicode"谦 ䷎",
        unicode"豫 ䷏",
        unicode"随 ䷐",
        unicode"蛊 ䷑",
        unicode"临 ䷒",
        unicode"观 ䷓",
        unicode"噬嗑 ䷔",
        unicode"贲 ䷕",
        unicode"剥 ䷖",
        unicode"复 ䷗",
        unicode"无妄 ䷘",
        unicode"大畜 ䷙",
        unicode"颐 ䷚",
        unicode"大过 ䷛",
        unicode"坎 ䷜",
        unicode"离 ䷝",
        unicode"咸   ䷞",
        unicode"恒 ䷟",
        unicode"遁 ䷠",
        unicode"大壮 ䷡",
        unicode"晋 ䷢",
        unicode"明夷 ䷣",
        unicode"家人 ䷤",
        unicode"睽 ䷥",
        unicode"蹇 ䷦",
        unicode"解 ䷧",
        unicode"损 ䷨",
        unicode"益 ䷩",
        unicode"夬 ䷪",
        unicode"姤 ䷫",
        unicode"萃 ䷬",
        unicode"升 ䷭",
        unicode"困 ䷮",
        unicode"井 ䷯",
        unicode"革 ䷰",
        unicode"鼎 ䷱",
        unicode"震 ䷲",
        unicode"艮 ䷳",
        unicode"渐 ䷴",
        unicode"归妹 ䷵",
        unicode"丰 ䷶",
        unicode"旅 ䷷",
        unicode"巽 ䷸",
        unicode"兑 ䷹",
        unicode"涣 ䷺",
        unicode"节 ䷻",
        unicode"中孚 ䷼",
        unicode"小过 ䷽",
        unicode"既济 ䷾",
        unicode"未济 ䷿"
    ];

    string[] private elements_5 = [
        unicode"金",
        unicode"木",
        unicode"水",
        unicode"火",
        unicode"土"
    ];

    string[] private chinese_zodiac = [
        unicode"鼠",
        unicode"牛",
        unicode"虎",
        unicode"兔",
        unicode"龍",
        unicode"蛇",
        unicode"馬",
        unicode"羊",
        unicode"猴",
        unicode"雞",
        unicode"狗",
        unicode"豬"
    ];

    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    function getTrigrams_64(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        return pluck(tokenId, "TRIGRAMS_64", trigrams_64);
    }

    function getElements_5(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        return pluck(tokenId, "ELEMENTS_64", elements_5);
    }

    function getChinese_Zodiac(uint256 tokenId)
        public
        view
        returns (string memory)
    {
        return pluck(tokenId, "CHINESE_ZODIAC_12", chinese_zodiac);
    }

    function pluck(
        uint256 tokenId,
        string memory keyPrefix,
        string[] memory sourceArray
    ) internal pure returns (string memory) {
        uint256 rand = random(string(abi.encodePacked(keyPrefix, tokenId)));
        string memory output = sourceArray[rand % sourceArray.length];
        // todo to Optimization?
        return output;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        string[7] memory parts;

        parts[
            0
        ] = '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMin meet" viewBox="0 0 100 100"><rect width="100" height="100" fill="gray" /><text x="10" y="20" class="base">';

        parts[1] = getTrigrams_64(tokenId);

        parts[2] = '</text><text x="20" y="40" class="base">';

        parts[3] = getElements_5(tokenId);

        parts[4] = '</text><text x="20" y="60" class="base">';

        parts[5] = getChinese_Zodiac(tokenId);

        parts[6] = "</text></svg>";

        string memory output = string(
            abi.encodePacked(
                parts[0],
                parts[1],
                parts[2],
                parts[3],
                parts[4],
                parts[5],
                parts[6]
            )
        );

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name":"',
                        unicode"Oriental Elements #",
                        Strings.toString(tokenId),
                        '", "description": "Welcome to Asia", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(output)),
                        '"}'
                    )
                )
            )
        );
        output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
        return output;
    }

    function claim(uint256 tokenId) public {
        require(
            tokenId > 0 && tokenId < MAX_MINTABLE_TOKENS,
            "Token ID invalid"
        );
        _safeMint(_msgSender(), tokenId);
    }
}