var Fiber = Npm.require('fibers');
 Log = function(error, msg) {
    console.log("Error "+error+ " msg "+msg);

}

var t = {};

t.MongoConnection = Meteor.wrapAsync(TestMongoConnection)

/**
 * Created by paolo on 06/12/15.
 */
Tinytest.addAsync('MongoConnection', function (test, next) {

    t.MongoConnection(test,next);



});

function TestMongoConnection(test,next) {
//var self = this;
    var result = false;
    var mongoConn = new MongoConnection(Meteor.settings.DbConnections['TEX']);

    mongoConn.open(Meteor.bindEnvironment(function (err) {
        //Log(err, "mongoConn.open()");
        test.equal(err, false);
        /*
         mongoConn.close(function (err) {
         Result(err, "mongoConn.close()");

         })
         */
            next();

    })
)

}
//next();


/*
Tinytest.add('SequelizeConnection', function (test) {
    Fiber(function () {


        var sqlConn = new SequelizeConnection(Meteor.settings.DbConnections['PLMSQL']);
        var self = this;
        sqlConn.open(function (err) {
            //Log(err, "SequelizeConnection.open()");
            test.equal(err, false);

            sqlConn.close(function (err) {
                Result(err, "SequelizeConnection.close()");

            })
        });
        //next();

    }).run();
});

Tinytest.add('DocsDef', function (test) {

    Fiber(function () {
        console.log(Meteor.settings.Def.Collections);

        var docsDef = new DocsDef(Meteor.settings.Def.Collections)
        var fieldAttr = docsDef.getFieldAttr('doc', '_id');
        console.log(fieldAttr);
        test.notEqual(fieldAttr, null);

        //Log(fieldAttr, '');
        //next();
    }).run();

});

*/