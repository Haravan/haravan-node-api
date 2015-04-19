var should = require('chai').should(),
    expect = require('chai').expect,
    nock = require('nock'),
    haravanAPI = require('../lib/haravan.js');

describe('Constructor Function: #haravanAPI', function(){

    it('throws error if no config object is passed in', function(){
        var msg = "HaravanAPI module expects a config object\n";
        expect(function(){
            var Haravan = new haravanAPI();
        }).to.throw(msg);
    });

    it('returns instanceof haravanAPI with "new" keyword', function(){
        var Haravan = new haravanAPI({});
        expect(Haravan).to.be.a.instanceof(haravanAPI);
    });

    it('returns instanceof haravanAPI without "new" keyword', function(){
        var Haravan = haravanAPI({});
        expect(Haravan).to.be.a.instanceof(haravanAPI);
    });

});

describe('#buildAuthURL', function(){

    var Haravan = new haravanAPI({
                shop: 'MYSHOP',
                haravan_api_key: 'abc123',
                haravan_shared_secret: 'asdf1234',
                haravan_scope: 'write_products',
                redirect_uri: 'http://localhost:3000/finish_auth'
            });


    it('builds correct string', function(){
        var auth_url = Haravan.buildAuthURL(),
            correct_auth_url = 'https://MYSHOP.myharavan.com/admin/oauth/authorize?client_id=abc123&scope=write_products&redirect_uri=http://localhost:3000/finish_auth';
        auth_url.should.equal(correct_auth_url);
    });

});

describe('#set_access_token', function(){
    var Haravan = new haravanAPI({});

    it('should not have access_token property initially', function(){
        Haravan.config.should.not.have.property('access_token');
    });

    it('should add correct access token to config object', function(){
        Haravan.config.should.not.have.property('access_token');
        var fake_token = '123456789';
        Haravan.set_access_token(fake_token);
        Haravan
            .config
            .should
            .have
            .property('access_token')
            .with
            .length(fake_token.length);
        Haravan
            .config
            .access_token
            .should
            .equal(fake_token);
    });

});

describe('#is_valid_signature', function(){
    it('should return correct signature', function(){

        // Values used below were pre-calculated and not part
        // of an actual shop.

        var Haravan = haravanAPI({}),
            params = {
                code: 'di389so32hwh28923823dh3289329hdd',
                shop: 'testy-tester.myharavan.com',
                timestamp: '1402539839',
                signature: '0132e77d7fb358ecd4645d86cfc39d27'
            };

        expect(Haravan.is_valid_signature(params)).to.equal(true);
    });
});

describe('#exchange_temporary_token', function(){
    it('should exchange a temporary token', function(done){

        // Values used below were pre-calculated and not part
        // of an actual shop.

        var Haravan = haravanAPI({
                shop: 'myshop',
                haravan_api_key: 'abc123',
                haravan_shared_secret: 'asdf1234',
                redirect_uri: 'http://localhost:3000/finish_auth',
                verbose: false
            }),
            params = {
                code: 'di389so32hwh28923823dh3289329hdd',
                shop: 'myshop',
                timestamp: '1402539839',
                signature: '679edfa2ebd05b2abcbb15b7fdc72934'
            };

        var haravanTokenFetch = nock('https://myshop.myharavan.com')
            .post('/admin/oauth/access_token')
            .reply(200, {
                "access_token": "abcd"
            });

        Haravan.exchange_temporary_token(params, function(err, res) {
          if (err) {
            return done(err);
          }
          haravanTokenFetch.done();
          done();
        });
    });
});

describe('#get', function(){
   it('should return correct response', function(done){

        var haravan_get = nock('https://myshop.myharavan.com')
                            .get('/admin/products/count.json')
                            .reply(200, {
                                "count": 2
                            });

        var Haravan = haravanAPI({
                shop: 'myshop',
                haravan_api_key: 'abc123',
                haravan_shared_secret: 'asdf1234',
                haravan_scope: 'write_products',
                redirect_uri: 'http://localhost:3000/finish_auth',
                verbose: false
            });

        Haravan.get('/admin/products/count.json', function(err, data, headers){
            expect(data).to.deep.equal({"count": 2});
            done();
        });

   });
});

describe('#post', function(){
    it('should return correct response', function(done){

        var post_data = {
              "product": {
                "title": "Burton Custom Freestlye 151",
                "body_html": "<strong>Good snowboard!</strong>",
                "vendor": "Burton",
                "product_type": "Snowboard",
                "variants": [
                  {
                    "option1": "First",
                    "price": "10.00",
                    "sku": 123
                  },
                  {
                    "option1": "Second",
                    "price": "20.00",
                    "sku": "123"
                  }
                ]
              }
            },
            response = {
              "product": {
                "body_html": "<strong>Good snowboard!</strong>",
                "created_at": "2014-05-23T14:18:12-04:00",
                "handle": "burton-custom-freestlye-151",
                "id": 1071559674,
                "product_type": "Snowboard",
                "published_at": "2014-05-23T14:18:12-04:00",
                "published_scope": "global",
                "template_suffix": null,
                "title": "Burton Custom Freestlye 151",
                "updated_at": "2014-05-23T14:18:12-04:00",
                "vendor": "Burton",
                "tags": "",
                "variants": [
                  {
                    "barcode": null,
                    "compare_at_price": null,
                    "created_at": "2014-05-23T14:18:12-04:00",
                    "fulfillment_service": "manual",
                    "grams": 0,
                    "id": 1044399349,
                    "inventory_management": null,
                    "inventory_policy": "deny",
                    "option1": "First",
                    "option2": null,
                    "option3": null,
                    "position": 1,
                    "price": "10.00",
                    "product_id": 1071559674,
                    "requires_shipping": true,
                    "sku": "123",
                    "taxable": true,
                    "title": "First",
                    "updated_at": "2014-05-23T14:18:12-04:00",
                    "inventory_quantity": 1,
                    "old_inventory_quantity": 1
                  },
                  {
                    "barcode": null,
                    "compare_at_price": null,
                    "created_at": "2014-05-23T14:18:12-04:00",
                    "fulfillment_service": "manual",
                    "grams": 0,
                    "id": 1044399350,
                    "inventory_management": null,
                    "inventory_policy": "deny",
                    "option1": "Second",
                    "option2": null,
                    "option3": null,
                    "position": 2,
                    "price": "20.00",
                    "product_id": 1071559674,
                    "requires_shipping": true,
                    "sku": "123",
                    "taxable": true,
                    "title": "Second",
                    "updated_at": "2014-05-23T14:18:12-04:00",
                    "inventory_quantity": 1,
                    "old_inventory_quantity": 1
                  }
                ],
                "options": [
                  {
                    "id": 1020890454,
                    "name": "Title",
                    "position": 1,
                    "product_id": 1071559674
                  }
                ],
                "images": [

                ]
              }
            };

        var haravan_get = nock('https://myshop.myharavan.com')
                            .post('/admin/products.json')
                            .reply(200, response);

        var Haravan = haravanAPI({
                shop: 'myshop',
                haravan_api_key: 'abc123',
                haravan_shared_secret: 'asdf1234',
                haravan_scope: 'write_products',
                redirect_uri: 'http://localhost:3000/finish_auth',
                verbose: false
            });

        Haravan.post('/admin/products.json', post_data, function(err, data, headers){
            expect(data).to.deep.equal(response);
            done();
        });

    });
});

describe('#put', function(){
    it('should return correct response', function(done){

        var put_data = {
              "product": {
                "id": 632910392,
                "title": "New product title"
              }
            },
            response = {
              "product": {
                "body_html": "<p>It's the small iPod with one very big idea: Video. Now the world's most popular music player, available in 4GB and 8GB models, lets you enjoy TV shows, movies, video podcasts, and more. The larger, brighter display means amazing picture quality. In six eye-catching colors, iPod nano is stunning all around. And with models starting at just $149, little speaks volumes.</p>",
                "created_at": "2014-05-23T14:17:55-04:00",
                "handle": "ipod-nano",
                "id": 632910392,
                "product_type": "Cult Products",
                "published_at": "2007-12-31T19:00:00-05:00",
                "published_scope": "global",
                "template_suffix": null,
                "title": "New product title",
                "updated_at": "2014-05-23T14:18:15-04:00",
                "vendor": "Apple",
                "tags": "Emotive, Flash Memory, MP3, Music",
                "variants": [
                  {
                    "barcode": "1234_pink",
                    "compare_at_price": null,
                    "created_at": "2014-05-23T14:17:55-04:00",
                    "fulfillment_service": "manual",
                    "grams": 200,
                    "id": 808950810,
                    "inventory_management": "haravan",
                    "inventory_policy": "continue",
                    "option1": "Pink",
                    "option2": null,
                    "option3": null,
                    "position": 1,
                    "price": "199.00",
                    "product_id": 632910392,
                    "requires_shipping": true,
                    "sku": "IPOD2008PINK",
                    "taxable": true,
                    "title": "Pink",
                    "updated_at": "2014-05-23T14:17:55-04:00",
                    "inventory_quantity": 10,
                    "old_inventory_quantity": 10
                  },
                  {
                    "barcode": "1234_red",
                    "compare_at_price": null,
                    "created_at": "2014-05-23T14:17:55-04:00",
                    "fulfillment_service": "manual",
                    "grams": 200,
                    "id": 49148385,
                    "inventory_management": "haravan",
                    "inventory_policy": "continue",
                    "option1": "Red",
                    "option2": null,
                    "option3": null,
                    "position": 2,
                    "price": "199.00",
                    "product_id": 632910392,
                    "requires_shipping": true,
                    "sku": "IPOD2008RED",
                    "taxable": true,
                    "title": "Red",
                    "updated_at": "2014-05-23T14:17:55-04:00",
                    "inventory_quantity": 20,
                    "old_inventory_quantity": 20
                  },
                  {
                    "barcode": "1234_green",
                    "compare_at_price": null,
                    "created_at": "2014-05-23T14:17:55-04:00",
                    "fulfillment_service": "manual",
                    "grams": 200,
                    "id": 39072856,
                    "inventory_management": "haravan",
                    "inventory_policy": "continue",
                    "option1": "Green",
                    "option2": null,
                    "option3": null,
                    "position": 3,
                    "price": "199.00",
                    "product_id": 632910392,
                    "requires_shipping": true,
                    "sku": "IPOD2008GREEN",
                    "taxable": true,
                    "title": "Green",
                    "updated_at": "2014-05-23T14:17:55-04:00",
                    "inventory_quantity": 30,
                    "old_inventory_quantity": 30
                  },
                  {
                    "barcode": "1234_black",
                    "compare_at_price": null,
                    "created_at": "2014-05-23T14:17:55-04:00",
                    "fulfillment_service": "manual",
                    "grams": 200,
                    "id": 457924702,
                    "inventory_management": "haravan",
                    "inventory_policy": "continue",
                    "option1": "Black",
                    "option2": null,
                    "option3": null,
                    "position": 4,
                    "price": "199.00",
                    "product_id": 632910392,
                    "requires_shipping": true,
                    "sku": "IPOD2008BLACK",
                    "taxable": true,
                    "title": "Black",
                    "updated_at": "2014-05-23T14:17:55-04:00",
                    "inventory_quantity": 40,
                    "old_inventory_quantity": 40
                  }
                ],
                "options": [
                  {
                    "id": 594680422,
                    "name": "Title",
                    "position": 1,
                    "product_id": 632910392
                  }
                ],
                "images": [
                  {
                    "created_at": "2014-05-23T14:17:55-04:00",
                    "id": 850703190,
                    "position": 1,
                    "product_id": 632910392,
                    "updated_at": "2014-05-23T14:17:55-04:00",
                    "src": "http://cdn.haravan.com/s/files/1/0006/9093/3842/products/ipod-nano.png?v=1400869075"
                  },
                  {
                    "created_at": "2014-05-23T14:17:55-04:00",
                    "id": 562641783,
                    "position": 2,
                    "product_id": 632910392,
                    "updated_at": "2014-05-23T14:17:55-04:00",
                    "src": "http://cdn.haravan.com/s/files/1/0006/9093/3842/products/ipod-nano-2.png?v=1400869075"
                  }
                ],
                "image": {
                  "created_at": "2014-05-23T14:17:55-04:00",
                  "id": 850703190,
                  "position": 1,
                  "product_id": 632910392,
                  "updated_at": "2014-05-23T14:17:55-04:00",
                  "src": "http://cdn.haravan.com/s/files/1/0006/9093/3842/products/ipod-nano.png?v=1400869075"
                }
              }
            };

        var haravan_get = nock('https://myshop.myharavan.com')
                            .put('/admin/products/12345.json')
                            .reply(200, response);

        var Haravan = haravanAPI({
                shop: 'myshop',
                haravan_api_key: 'abc123',
                haravan_shared_secret: 'asdf1234',
                haravan_scope: 'write_products',
                redirect_uri: 'http://localhost:3000/finish_auth',
                verbose: false
            });

        Haravan.put('/admin/products/12345.json', put_data, function(err, data, headers){
            expect(data).to.deep.equal(response);
            done();
        });

    });
});

describe('#delete', function(){
    it('should return correct response', function(done){

        var haravan_get = nock('https://myshop.myharavan.com')
                            .delete('/admin/products/12345.json')
                            .reply(200, {});

        var Haravan = haravanAPI({
                shop: 'myshop',
                haravan_api_key: 'abc123',
                haravan_shared_secret: 'asdf1234',
                haravan_scope: 'write_products',
                redirect_uri: 'http://localhost:3000/finish_auth',
                verbose: false
            });

        Haravan.delete('/admin/products/12345.json', function(err, data, headers){
            expect(data).to.deep.equal({});
            done();
        });

    });
});