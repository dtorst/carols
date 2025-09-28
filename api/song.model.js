import { DataTypes, Model } from 'sequelize';
import sequelize from './db.js';


class Song extends Model {}


Song.init({
title: { type: DataTypes.STRING, allowNull: false },
key: { type: DataTypes.STRING },
composer: { type: DataTypes.STRING },
score_url: { type: DataTypes.TEXT },
ref_full_url: { type: DataTypes.TEXT },
ref_s_url: { type: DataTypes.TEXT },
ref_a_url: { type: DataTypes.TEXT },
ref_t_url: { type: DataTypes.TEXT },
ref_b_url: { type: DataTypes.TEXT },
notes: { type: DataTypes.TEXT },
}, {
sequelize,
modelName: 'Song',
tableName: 'songs'
});


export default Song;