
const auth = require("../config/firebase");

const validateFirebaseToken = async (req, res, next) => {
  
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decodedToken = await auth.verifyIdToken(token);
    res.locals.user = decodedToken.uid;
    next();
  } catch (error) {
    console.error("Error verifying Firebase token:", error);
    return res.status(403).json({ error: "Unauthorized!" });
  }

};

module.exports = validateFirebaseToken;
