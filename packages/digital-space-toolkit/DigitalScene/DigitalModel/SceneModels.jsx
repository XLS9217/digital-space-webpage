import React from 'react'//for webpack consistency,
import { MODEL_TYPE } from '../../SceneTypeEnum';
import BaseModel from './BaseModel.jsx';
import FrameModel from './FrameModel.jsx';

export default function SceneModels({ models = [] }) {
    return (
        <>
            {models.map((model, index) => {
                const modelProps = {
                    url: model.url,
                    name: model.name,
                    scale: model.scale,
                    position: model.position,
                    rotation: model.rotation,
                    modelData: model
                };
                const key = model.url || model.name || index;
                if (model.type === MODEL_TYPE.FRAME) {
                    return <FrameModel key={key} {...modelProps} />
                } else {
                    return <BaseModel key={key} {...modelProps} />
                }
            })}
        </>
    )
}