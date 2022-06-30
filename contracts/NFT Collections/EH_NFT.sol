// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "./_BASE.sol";

contract EH_NFT is Collection_BASE("Erik Hanchett NFT Collection", "EH_NFT", "Erik NFT Project")
{
    string[] private collection =
    [
        "Royal"
    ,   "Autumn"
    ,   "Cecilia"
    ,   "Perry"
    ,   "Joy"
    ,   "Rhett"
    ,   "Billy"
    ,   "Luke"
    ,   "Wayne"
    ,   "Amy"
    ];

    function getImage(uint256 tokenId)
        internal view override
        returns (bytes memory)
    {
        return abi.encodePacked
        (
            '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1920 1080" style="enable-background:new 0 0 1920 1080;" xml:space="preserve"> <style type="text/css"> .st0{fill:#fff;stroke:#000000;stroke-width:4;stroke-miterlimit:10;} * { background-color: coral; } @keyframes fancyshmancy { to { stroke-dashoffset: 0; } } @keyframes flashy { from { fill: #fff; } to { fill: turquoise; } } #beepcord { stroke-dasharray: 1800; stroke-dashoffset: 1800; animation-timing-function: ease-in-out; animation-iteration-count: 1; animation: fancyshmancy 6s linear forwards; } text { font-size:6rem; transform: skew(8deg, 331deg) translate(-11rem, 23rem); } #screen, .back-ground-color-screen-02, .back-ground-color-screen-03, .back-ground-color-screen-04, .back-ground-color-screen-05 { stroke: #000; stroke-width: 4; fill: #fff; animation: flashy 5s infinite; } .fixing-background-01 { fill: coral; stroke: #000; stroke-width: 4; } </style> <g id="bored"> <polygon class="st0" points="641,887 823,990 1326,706 1142,603 "/> </g> <g id="keys"> <polygon class="st0" points="732,887 1141,655 1233,706 828,936 "/> <line class="st0" x1="778.49" y1="861.5" x2="869.43" y2="912.51"/> <line class="st0" x1="823.96" y1="835.64" x2="913.81" y2="887.01"/> <line class="st0" x1="869.43" y1="808.94" x2="959" y2="862"/> <line class="st0" x1="913.81" y1="783.28" x2="1004.94" y2="835.47"/> <line class="st0" x1="960" y1="757.63" x2="1051.85" y2="808.94"/> <line class="st0" x1="1006" y1="732.26" x2="1097.23" y2="783.28"/> <line class="st0" x1="1186" y1="681" x2="781.99" y2="912.51"/> <line class="st0" x1="1051.85" y1="705.57" x2="1141.83" y2="757.78"/> <line class="st0" x1="1097.76" y1="679.83" x2="1185.79" y2="730.77"/> </g> <g id="computer"> <polygon class="st0" points="458.5,370.5 595.5,448.5 595.5,861.5 458.5,783.5 "/> <polyline class="st0" points="458,371 960,87 1052,138 1097,164 595,448 "/> <polyline class="st0" points="1097,164 1102,577 1006,629 595,861 "/> </g> <g id="screen"> <polygon class="back-ground-color-screen-01" points="641,472 1050,241 1050,550 639,783 "/> </g> <g id="beepcord"> <text x="732" y="577" class="base">'
        ,   pluck(tokenId, "FIRST", collection)
        ,   '</text> <path class="st0" d="M1233.88,654.43"/> <path class="st0" d="M1185.79,679.83"/> <path class="st0" d="M1097.23,731.71"/> <polyline class="fixing-background-01" points="1102,419 1142,396 1234,448 1325,396 1370,422 1233,499 1186,472 1141,499 1186,526 1228,551 1318,499 1370,526 1319,551 1279,577 1233,603 1279,629 1325,603 1366,629 1280.18,679.83 "/> </g> </svg>'
        );
    }
}