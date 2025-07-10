const logoutEmployeesController = {
  logout: (req, res) => {
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });

    return res.status(200).json({ message: "Logout exitoso" });
  }
};

export default logoutEmployeesController;