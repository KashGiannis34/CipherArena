"""
Codebusters cipher package - lazy loading for faster startup
"""

from .constants import NIHILIST_KEYWORDS, PROBLEM_TYPES

# Lazy imports - modules loaded on first access
_loaded = {}

def __getattr__(name):
    """Lazy load functions on first access"""
    if name in _loaded:
        return _loaded[name]

    # Map function names to their modules
    _module_map = {
        # basic_math
        'generate_two_digit_multiplication': 'basic_math',
        'check_two_digit_multiplication': 'basic_math',
        'generate_letter_to_value': 'basic_math',
        'check_letter_to_value': 'basic_math',
        'generate_three_digit_subtraction': 'basic_math',
        'check_three_digit_subtraction': 'basic_math',
        'generate_mod_26': 'basic_math',
        'check_mod_26': 'basic_math',
        'generate_modular_inverse': 'basic_math',
        'check_modular_inverse': 'basic_math',
        'generate_binary_to_decimal': 'basic_math',
        'check_binary_to_decimal': 'basic_math',
        'generate_remainder_cheese': 'basic_math',
        'check_remainder_cheese': 'basic_math',
        'generate_memorize_decimals': 'basic_math',
        'check_memorize_decimals': 'basic_math',
        # shift_ciphers
        'generate_shift_letter': 'shift_ciphers',
        'check_shift_letter': 'shift_ciphers',
        'generate_shift_word': 'shift_ciphers',
        'check_shift_word': 'shift_ciphers',
        # affine_cipher
        'generate_affine_letter': 'affine_cipher',
        'check_affine_letter': 'affine_cipher',
        'generate_affine_word': 'affine_cipher',
        'check_affine_word': 'affine_cipher',
        # matrix_ciphers
        'generate_inverse_matrix': 'matrix_ciphers',
        'check_inverse_matrix': 'matrix_ciphers',
        'generate_hill_word': 'matrix_ciphers',
        'check_hill_word': 'matrix_ciphers',
        # atbash_cipher
        'generate_atbash_letter': 'atbash_cipher',
        'check_atbash_letter': 'atbash_cipher',
        'generate_atbash_word': 'atbash_cipher',
        'check_atbash_word': 'atbash_cipher',
        # baconian_cipher
        'generate_baconian': 'baconian_cipher',
        'check_baconian': 'baconian_cipher',
        # nihilist_cipher
        'generate_nihilist_table': 'nihilist_cipher',
        'nihilist_table_to_display': 'nihilist_cipher',
        'nihilist_encode_letter': 'nihilist_cipher',
        'nihilist_decode_number': 'nihilist_cipher',
        'generate_nihilist_encode': 'nihilist_cipher',
        'check_nihilist_encode': 'nihilist_cipher',
        'generate_nihilist_decode': 'nihilist_cipher',
        'check_nihilist_decode': 'nihilist_cipher',
        'generate_nihilist_keyword_decode': 'nihilist_cipher',
        'check_nihilist_keyword_decode': 'nihilist_cipher',
    }

    if name not in _module_map:
        raise AttributeError(f"module 'codebusters' has no attribute '{name}'")

    # Import the module and cache the function
    module_name = _module_map[name]
    module = __import__(f'codebusters.{module_name}', fromlist=[name])
    func = getattr(module, name)
    _loaded[name] = func
    return func
