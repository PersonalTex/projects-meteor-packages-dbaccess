var util = Npm.require("util");
var Future = Npm.require('fibers/future');


DbCommandManager = function(connection) {
    this.connection = connection;
    this.command = null;
};


DbCommandManager.prototype.setCommand = function(command) {
  this.command = command;
}

SqlCommandManager = function(connection, dbTables) {
    DbCommandManager.call(this, connection);
    this.dbTables = dbTables;
//    this.sql = '';


};

SqlCommandManager.prototype = Object.create(DbCommandManager.prototype);


SqlCommandManager.prototype.prepareSql = function(tableName, doc, action) {
    var sql = ''
    if(action == 'i') {
        var fields =  this.getInsertFields(tableName,doc, false);

        // no fields to write in sql table
        if(fields == '')
          return '';

        var params = this.getInsertFields(tableName,doc, true);
        return util.format('INSERT INTO %s (%s) VALUES (%s)', tableName, fields,params);
    }
    else  if(action == 'u') {

        // no fields to write in sql table
        var fields = this.getUpdateFields(tableName,doc);
        // no fields to write in sql table
        if(fields == '')
            return '';

        return util.format("UPDATE %s set %s %s", tableName, fields, this.getFilter(tableName));
    }
    else  if(action == 'd') {
        return util.format("DELETE FROM  %s %s ", tableName, this.getFilter(tableName));
    }

}

SqlCommandManager.prototype.prepareInsert = function(tableName, doc) {

  return this,prepareSql(tableName,doc, 'i');
};

SqlCommandManager.prototype.prepareUpdate = function(tableName, doc) {

    return this.prepareSql(tableName,doc, 'u');
};

SqlCommandManager.prototype.prepareDelete = function(tableName) {
    return this.prepareSql(tableName,doc, 'd');
};

SqlCommandManager.prototype.getFilter = function(tableName) {
    return (' WHERE mid = :_id');
};

// Return list of field as
// 'fieldName1, fieldName
// :fieldName1, fieldNamen (if asParam == true)
SqlCommandManager.prototype.getInsertFields = function (tableName,doc, asParam) {
    var self = this;
    var result = '';
    var field = null;
    for (item in doc.o) {

        if(doc.o[item].constructor == {}.constructor) {
            for(item2 in doc.o[item]) {
                field = self.dbTables.field(tableName, item, item2);
                // for nested value  linkFieldName is mandatory
                if(field && field.linkFieldName)
                 result+= asParam ? ':'+item+'_'+item2+',' : field.linkFieldName+',';
            }
        }
        else {
            field = self.dbTables.field(tableName, item);
            if(field)
            result += asParam ? ':' + item + ',' : (field.linkFieldName || item)+ ',';
        }
    }
    result = result.slice(0, -1);
    return result;
};

// Return list of field as
// 'fieldName1, fieldName
// :fieldName1, fieldNamen (if asParam == true)
SqlCommandManager.prototype.getUpdateFields = function (tableName,doc) {
    var result = '';
    var field = '';
    for (item in doc.o.$set) {

        if(doc.o.$set[item].constructor == {}.constructor) {
            for (item2 in doc.o.$set[item]) {
                field = self.dbTables.field(tableName, item1, item2);
                // for nested value  linkFieldName is mandatory
                if(field && field.linkFieldName)
                  result += util.format(" %s = :%s,",field.linkFieldName, item+'_'+item2);
            }
        }
        else {
            field = self.dbTables.field(tableName, item);
            if(field)
              result += util.format(" %s = :%s,", field.linkFieldName || item, item);
        }

    }
    if(result != '')
      result = result.slice(0, -1);

    return result;
};


SequelizeCommandManager = function(connection, dbTables) {
    SqlCommandManager.call(this, connection, dbTables);

    this.setCommand(new SequelizeCommand(connection));
}


SequelizeCommandManager.prototype = Object.create(SqlCommandManager.prototype);

SequelizeCommandManager.prototype.execSql = function(sql, doc, action) {
    try {
      var future = new Future();

      future.return(this.command.execSql(sql, doc, action).wait());
      return future.wait();
    }
      catch(e) {
          console.log(e)
          future.return(false);
          return future.wait();
      }
}.future();



OpSequelizeCommandManager = function(connection, dbTables) {
    SequelizeCommandManager.call(this, connection, dbTables);
//    this.tableName = '';
}

OpSequelizeCommandManager.prototype = Object.create(SqlCommandManager.prototype);



OpSequelizeCommandManager.prototype.execSql = function(sql, tableName, doc, action) {
    try {

        var self = this;
        var future = new Future();
        var record =  action == 'u' ? _.extend({}, doc.o.$set)  : _.extend({}, doc.o);
        if( action == 'u')
            record['_id'] = doc.o2['_id'].toString();
        else if(action == 'd')
            record['_id'] = doc.o['_id'].toString();

        this.dbTables.normalizeRecord(tableName, record);

        future.return(this.command.execSql(sql, record, action).wait());
        return future.wait();
    }
    catch(e) {
        console.log(e)
    }
}.future();

OpSequelizeCommandManager.prototype.prepareInsert = function(tableName, doc) {
   return this.prepareSql(tableName,doc, 'i');
}

OpSequelizeCommandManager.prototype.prepareUpdate = function(tableName, doc) {
    return this.prepareSql(tableName,doc, 'u');
}

OpSequelizeCommandManager.prototype.prepareDelete = function(tableName, doc) {
    return this.prepareSql(tableName,doc, 'd');
}




