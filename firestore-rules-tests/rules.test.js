const fs = require("fs");
const path = require("path");
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} = require("@firebase/rules-unit-testing");
const {
  doc,
  getDoc,
  setDoc,
} = require("firebase/firestore");

let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "firebolt-leadsoffers", // your real Firebase project ID
    firestore: {
      rules: fs.readFileSync(
        path.join(__dirname, "..", "firestore.rules"),
        "utf8"
      ),
    },
  });

  // Seed some data bypassing rules
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    // Create two user docs
    await setDoc(doc(db, "users/alice"), {
      email: "alice@example.com",
      displayName: "Alice",
    });
    await setDoc(doc(db, "users/bob"), {
      email: "bob@example.com",
      displayName: "Bob",
    });

    // Create some offers
    await setDoc(doc(db, "offers/offer1"), {
      userId: "alice",
      title: "Offer for Alice",
      status: "pending",
    });
    await setDoc(doc(db, "offers/offer2"), {
      userId: "bob",
      title: "Offer for Bob",
      status: "pending",
    });

    // Leads example (admin-only in real app)
    await setDoc(doc(db, "leads/lead1"), {
      name: "Lead One",
    });
  });
});

after(async () => {
  await testEnv.cleanup();
});

describe("Firestore security rules for Firebolt", () => {
  it("allows a user to read their own user doc", async () => {
    const aliceCtx = testEnv.authenticatedContext("alice");
    const aliceDb = aliceCtx.firestore();

    await assertSucceeds(getDoc(doc(aliceDb, "users/alice")));
  });

  it("blocks a user from reading another user's doc", async () => {
    const aliceCtx = testEnv.authenticatedContext("alice");
    const aliceDb = aliceCtx.firestore();

    await assertFails(getDoc(doc(aliceDb, "users/bob")));
  });

  it("allows a signed-in user to create their own user doc", async () => {
    const charlieCtx = testEnv.authenticatedContext("charlie");
    const charlieDb = charlieCtx.firestore();

    await assertSucceeds(
      setDoc(doc(charlieDb, "users/charlie"), {
        email: "charlie@example.com",
      })
    );
  });

  it("blocks creating a user doc for a different uid", async () => {
    const aliceCtx = testEnv.authenticatedContext("alice");
    const aliceDb = aliceCtx.firestore();

    await assertFails(
      setDoc(doc(aliceDb, "users/someoneElse"), {
        email: "fake@example.com",
      })
    );
  });

  it("allows user to read their own offers", async () => {
    const aliceCtx = testEnv.authenticatedContext("alice");
    const aliceDb = aliceCtx.firestore();

    await assertSucceeds(getDoc(doc(aliceDb, "offers/offer1")));
  });

  it("blocks user from reading someone else's offers", async () => {
    const aliceCtx = testEnv.authenticatedContext("alice");
    const aliceDb = aliceCtx.firestore();

    await assertFails(getDoc(doc(aliceDb, "offers/offer2")));
  });

  it("blocks any client from creating offers directly", async () => {
    const aliceCtx = testEnv.authenticatedContext("alice");
    const aliceDb = aliceCtx.firestore();

    await assertFails(
      setDoc(doc(aliceDb, "offers/newOffer"), {
        userId: "alice",
        title: "Hacked offer",
      })
    );
  });

  it("blocks client from reading leads", async () => {
    const aliceCtx = testEnv.authenticatedContext("alice");
    const aliceDb = aliceCtx.firestore();

    await assertFails(getDoc(doc(aliceDb, "leads/lead1")));
  });
});
