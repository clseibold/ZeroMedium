// Database Models
var { Model, DbQuery } = require('./ZeroQuery/db.js');
class Story extends Model {
    static get tableName() { return "stories"; }

    constructor() {
        // Note: You can leave off columns if you don't
        // want them stored in the model.
        super([
            "story_id",
            "title",
            "slug",
            "description",
            "body",
            "tags",
            "language",
            "date_updated",
            "date_added",
            // LEFT JOIN json
            "directory",
            "cert_user_id",
            "json_id",
            // LEFT JOIN keyvalue
            "value"
        ]);
    }

    static get(auth_address, slug) {
        return Story.select("story_id", "title", "slug", "description", "body", "tags", "language", "date_updated", "date_added", "value")
            .leftJoinJson().leftJoinUsing("keyvalue", "json_id")
            .where("directory", "users/" + auth_address)
            .andWhere("slug", slug).andWhere("key", "name").log("<Story: get> ").get(page);
    }

    static getMinimal(auth_address, story_id) {
        return Story.select("story_id", "title", "slug", "language", "directory", "value")
            .leftJoinJson().leftJoinUsing("keyvalue", "json_id")
            .where("directory", "users/" + auth_address)
            .andWhere("story_id", story_id).andWhere("key", "name").log("<Story: getMinimal> ").get(page);
    }

    static getFromTag(tagSlug) {
        return Story.all().leftJoinJson().leftJoinUsing("keyvalue", "json_id")
            .where("REPLACE(tags, \" \", \"-\")", "LIKE", "%" + tagSlug + "%")
            .andWhere("key", "name")
            .orderBy("date_added", "DESC").log("<Story: getFromTag> ").get(page);
    }

    /*
    static userDatabases(auth_address) {
        return Database.all().leftJoinJson().where('directory', 'users/' + auth_address).log("[userDatabases] ");
    }

    static userDatabase(auth_address, dbId) {
        return Database.all().leftJoinJson().where('directory', 'users/' + auth_address)
            .andWhere('database_id', dbId).limit(1).log("[userDatabase] ");
    }*/
}

module.exports = { Model, DbQuery, Story };