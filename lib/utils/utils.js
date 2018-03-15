// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.  

import MD5 from './md5';
import renderer from 'renderer.js';

const md5 = new MD5();

export default function getHash(material) {
    let effect = material._effect;
    if (effect) {
        let i, j, techData, property;
        let hashData = "";

        //effect._defines
        hashData += JSON.stringify(effect._defines);
        //effect._techniques
        for (i = 0; i < effect._techniques.length; i++) {
            techData = effect._techniques[i];
            //technique.stageIDs
            hashData += techData.stageIDs + "_";
            //technique._layer
            hashData += + techData._layer + "_";
            //technique.passes
            for (j = 0; j < techData.passes.length; j++) {
                hashData += JSON.stringify(techData.passes[j]);
            }
            //technique._parameters
            for (j = 0; j < techData._parameters.length; j++) {
                property = effect._properties[techData._parameters[j].name];
                if (!property) {
                    continue;
                }
                switch(techData._parameters[j].type) {
                    case renderer.PARAM_INT:
                    case renderer.PARAM_INT2:
                    case renderer.PARAM_INT3:
                    case renderer.PARAM_INT4:
                    case renderer.PARAM_FLOAT:
                    case renderer.PARAM_FLOAT2:
                    case renderer.PARAM_FLOAT3:
                    case renderer.PARAM_FLOAT4:
                    case renderer.PARAM_COLOR3:
                    case renderer.PARAM_COLOR4:
                    case renderer.PARAM_MAT2:
                    case renderer.PARAM_MAT3:
                    case renderer.PARAM_MAT4:
                        hashData += JSON.stringify(property);
                        break;
                    case renderer.PARAM_TEXTURE_2D:
                        hashData += material._textureInstanceId;
                        break;
                    case renderer.PARAM_TEXTURE_CUBE:
                        break;
                    default:
                        break;
                }
            }
        }
        return md5.update(hashData);
    }
};