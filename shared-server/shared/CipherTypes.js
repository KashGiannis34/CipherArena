export const cipherTypes = {
    'Aristocrat' : {'directMap':true, 'keys':['!'], 'addOn':'freqTable', 'spacing':-1, 'length':[70, 130], 'options':['K',"!Random","1","2","3"], letterGap: false, bypassCheck: false, stackKey: false}, //! means no frontend visibility
    'Xenocrypt' : {'directMap':true, 'keys':['!'], 'addOn':'freqTable', 'spacing':-1, 'length':[70, 130], 'options':['K',"!Random","1","2","3"], letterGap: false, bypassCheck: false, stackKey: false},
    'Patristocrat' : {'directMap':true, 'keys':['!'], 'addOn':'freqTable', 'spacing':5, 'length':[100, 140], 'options':['K',"!Random","1","2","3"], letterGap: false, bypassCheck: false, stackKey: false},
    'Porta' : {'directMap':false, 'keys':['key'], 'addOn':'portaTable', 'spacing':5, 'length':[30, 80], 'options':["Solve", "!Decode", "!Encode"], letterGap: false, bypassCheck: false, stackKey: true},
    'Atbash' : {'directMap':false, 'keys':[], 'addOn':'atbashTable', 'spacing':-1, 'length':[60, 100], 'options':["Solve", "!Decode", "!Encode"], letterGap: false, bypassCheck: false, stackKey: false},
    'Caesar' : {'directMap':false, 'keys':[], 'addOn':'caesarTable', 'spacing':-1, 'length':[60, 100], 'options':[], letterGap: false, bypassCheck: false, stackKey: false},
    'Affine' : {'directMap':false, 'keys':['value of a', 'value of b'], 'addOn':'mathAddOn', 'spacing':5, 'length':[60, 100], 'options':["Solve", "!Decode", "!Encode"], letterGap: false, bypassCheck: false, stackKey: false},
    'Baconian' : {'directMap':false, 'keys':[], 'addOn':'baconTable', 'spacing':0, 'length':[70, 110], 'options':[], letterGap: true, bypassCheck: true, stackKey: false},
    'Nihilist' : {'directMap':false, 'keys':['keyword', 'polybius key'], 'addOn':'polybiusSquare', 'spacing':5, 'length':[80, 120], 'options':[], letterGap: true, bypassCheck: true, stackKey: true},
    'Checkerboard' : {'directMap':false, 'keys':['!', '!', 'polybius key'], 'addOn':'checkerboardTable', 'spacing':5, 'length':[80, 120], 'options':[], letterGap: true, bypassCheck: true, stackKey: false},
    'Hill' : {'directMap':false, 'keys':['key'], 'addOn':'mathAddOn', 'spacing':0, 'length':[0, 30], 'options':["Solve", "!Decode", "!Encode"], letterGap: false, bypassCheck: false, stackKey: false}
};
