// Copyright 2014, Renasar Technologies Inc.
/* jshint: node:true */

'use strict';

var di = require('di');

module.exports = encryptionFactory;

di.annotate(encryptionFactory, new di.Provide('Encryption'));
di.annotate(encryptionFactory,
    new di.Inject(
        'crypto'
    )
);

function encryptionFactory(crypto) {
    function Encryption () {
    }

    Encryption.prototype.key = function () {
        return crypto.randomBytes(32).toString('base64');
    };

    Encryption.prototype.iv = function () {
        return crypto.randomBytes(16).toString('base64');
    };

    Encryption.prototype.encrypt = function (data, key, iv) {
        iv = iv || this.iv();

        var cipher = crypto.createCipheriv(
            'aes-256-cbc',
            new Buffer(key, 'base64'),
            new Buffer(iv, 'base64')
        );

        var encrypted = Buffer.concat([
            cipher.update(data),
            cipher.final()
        ]);

        return '%s.%s'.format(
            iv.toString('base64'),
            encrypted.toString('base64')
        );
    };

    Encryption.prototype.decrypt = function (data, key) {
        var parts = data.split('.');

        var cipher = crypto.createDecipheriv(
            'aes-256-cbc',
            new Buffer(key, 'base64'),
            new Buffer(parts[0], 'base64')
        );

        var decrypted = Buffer.concat([
            cipher.update(new Buffer(parts[1], 'base64')),
            cipher.final()
        ]);

        return decrypted.toString();
    };

    return Encryption;
}