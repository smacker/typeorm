import "reflect-metadata";
import { expect } from "chai";
import {createTestingConnections, closeTestingConnections} from "../../../utils/test-utils";
import {Connection} from "../../../../src/connection/Connection";
import { Category, Post } from "./entity";
import * as m2mCustom from "./many-to-many-custom";

describe("migrations > generate command", () => {
    let connections: Connection[];
    before(async () => connections = await createTestingConnections({
        migrations: [],
        schemaCreate: false,
        dropSchema: true,
        entities: [Post, Category],
    }));
    after(() => closeTestingConnections(connections));

    it("can recognize model changes", () => Promise.all(connections.map(async connection => {
        const sqlInMemory = await connection.driver.createSchemaBuilder().log();
        sqlInMemory.upQueries.length.should.be.greaterThan(0);
        sqlInMemory.downQueries.length.should.be.greaterThan(0);
    })));

    it("does not generate when no model changes", () => Promise.all(connections.map(async connection => {
        await connection.driver.createSchemaBuilder().build();

        const sqlInMemory = await connection.driver.createSchemaBuilder().log();

        sqlInMemory.upQueries.length.should.be.equal(0);
        sqlInMemory.downQueries.length.should.be.equal(0);

    })));
 });

 describe("migrations > generate command many-to-many with custom relation", () => {
    let connections: Connection[];
    before(
        async () =>
            (connections = await createTestingConnections({
                migrations: [],
                schemaCreate: false,
                dropSchema: true,
                entities: [
                    m2mCustom.Post,
                    m2mCustom.Category,
                    m2mCustom.PostToCategory,
                ],
            }))
    );
    after(() => closeTestingConnections(connections));

    it("can recognize model changes", () =>
        Promise.all(
            connections.map(async (connection) => {
                const sqlInMemory = await connection.driver
                    .createSchemaBuilder()
                    .log();
                sqlInMemory.upQueries.length.should.be.greaterThan(0);
                sqlInMemory.downQueries.length.should.be.greaterThan(0);
            })
        ));

    it("does not generate when no model changes", () =>
        Promise.all(
            connections.map(async (connection) => {
                await connection.driver.createSchemaBuilder().build();

                const sqlInMemory = await connection.driver
                    .createSchemaBuilder()
                    .log();

                sqlInMemory.upQueries.length.should.be.equal(0);
                sqlInMemory.downQueries.length.should.be.equal(0);
            })
        ));

    it("the relation work correctly", () =>
        Promise.all(
            connections.map(async (connection) => {
                await connection.driver.createSchemaBuilder().build();

                const category = await connection.manager.save(
                    new m2mCustom.Category({ name: "test category" })
                );
                const post = await connection.manager.save(
                    new m2mCustom.Post({ title: "test post" })
                );
                await connection.getRepository(m2mCustom.PostToCategory).insert(
                    new m2mCustom.PostToCategory({
                        postId: post.id,
                        categoryId: category.id,
                        order: 1,
                    })
                );

                const postFound = await connection
                    .getRepository(m2mCustom.Post)
                    .findOne(post.id, { relations: ["categories"] });

                expect(postFound).not.to.be.undefined;
                postFound!.should.deep.equal(
                    new m2mCustom.Post({
                        id: 1,
                        title: "test post",
                        text: "This is default text.",
                        categories: [
                            new m2mCustom.Category({
                                id: 1,
                                name: "test category",
                            }),
                        ],
                    })
                );
            })
        ));
});
