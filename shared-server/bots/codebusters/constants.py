# Constants for the Codebusters Bot

NIHILIST_KEYWORDS = [
    "cipher", "decode", "encode", "secret", "keyword", "matrix", "alpha", "bravo",
    "charlie", "delta", "echo", "foxtrot", "golf", "hotel", "india", "juliet",
    "kilo", "lima", "mike", "november", "oscar", "papa", "quebec", "romeo",
    "sierra", "tango", "uniform", "victor", "whiskey", "xray", "yankee", "zulu",
    "puzzle", "logic", "number", "letter", "random", "pattern", "signal", "vector",
    "crypto", "shadow", "agent", "bond", "riddle", "secretive", "covert", "stealth",
    "answer", "question", "reason", "method", "search", "finder", "solver", "detect",
    "matrixkey", "permute", "square", "cipherkey", "classic", "simple", "garden",
    "ocean", "forest", "mountain", "river", "valley", "desert", "island", "harbor",
    "castle", "bridge", "anchor", "beacon", "compass", "orbit", "stellar", "nebula",
    "comet", "meteor", "planet", "saturn", "mercury", "venus", "earth", "mars",
    "jupiter", "uranus", "neptune", "pluto", "silver", "golden", "cobalt", "carbon",
    "oxygen", "nitrogen", "helium", "argon"
]

# Problem type mapping for easy reference
PROBLEM_TYPES = {
    1: "two_digit_multiplication",
    2: "letter_to_value",
    3: "three_digit_subtraction",
    4: "shift_letter",
    5: "shift_word",
    6: "inverse_matrix",
    7: "mod_26",
    8: "modular_inverse",
    9: "affine_letter",
    10: "affine_word",
    11: "hill_word",
    12: "baconian",
    13: "binary_to_decimal",
    14: "remainder_cheese",
    15: "memorize_decimals",
    16: "atbash_letter",
    17: "atbash_word",
    18: "nihilist_encode",
    19: "nihilist_decode",
    20: "nihilist_keyword_decode",
}

# Modular inverses lookup table (for numbers coprime to 26)
MODULAR_INVERSE_NUMS = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25]
MODULAR_INVERSE_VALUES = [1, 9, 21, 15, 3, 19, 7, 23, 11, 5, 17, 25]

# Baconian cipher codes
BACONIAN_CODES = {
    "00000": "a", "00001": "b", "00010": "c", "00011": "d",
    "00100": "e", "00101": "f", "00110": "g", "00111": "h",
    "01000": "i,j", "01001": "k", "01010": "l", "01011": "m",
    "01100": "n", "01101": "o", "01110": "p", "01111": "q",
    "10000": "r", "10001": "s", "10010": "t", "10011": "u,v",
    "10100": "w", "10101": "x", "10110": "y", "10111": "z",
}

# Binary keys for binary to decimal conversion
BINARY_KEYS = [
    "00000", "00001", "00010", "00011", "00100", "00101", "00110", "00111",
    "01000", "01001", "01010", "01011", "01100", "01101", "01110", "01111",
    "10000", "10001", "10010", "10011", "10100", "10101", "10110", "10111"
]
