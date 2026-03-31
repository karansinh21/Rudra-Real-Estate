const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ✅ GET - Badha users ni list (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role, status, search } = req.query;

    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isVerified: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, users, total: users.length });
  } catch (error) {
    console.error('getAllUsers error:', error);
    res.status(500).json({ error: 'Users fetch karva ma error' });
  }
};

// ✅ GET - Pending approval wala BROKER/LAWYER
const getPendingUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        status: 'PENDING',
        role: { in: ['BROKER', 'LAWYER'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        professionalDetails: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, users, total: users.length });
  } catch (error) {
    console.error('getPendingUsers error:', error);
    res.status(500).json({ error: 'Pending users fetch karva ma error' });
  }
};

// ✅ GET - Ek user ni detail
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isVerified: true,
        address: true,
        city: true,
        state: true,
        professionalDetails: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User maldo nahi' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('getUserById error:', error);
    res.status(500).json({ error: 'User fetch karva ma error' });
  }
};

// ✅ GET - Lawyer public profile (no auth needed)
// Schema ma: profileImage nathi (avatar che), barCouncilId nathi (professionalDetails JSON ma che)
const getLawyerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const where = id
      ? { id, role: 'LAWYER' }
      : { role: 'LAWYER', status: 'ACTIVE' };

    const lawyerRaw = await prisma.user.findFirst({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        professionalDetails: true, // JSON - specialization, experience, barCouncilId etc
        role: true,
        status: true,
        isVerified: true,
        legalServices: {           // lawyer na services
          select: {
            id: true,
            name: true,            // schema ma 'name' che - 'serviceName' nahi!
            description: true,
            price: true,
          }
        }
      }
    });

    if (!lawyerRaw) {
      return res.status(404).json({
        error: id ? 'Lawyer maldo nahi' : 'Koi active lawyer nathi maldo'
      });
    }

    // professionalDetails JSON mathi extra fields khadho
    const pd = lawyerRaw.professionalDetails || {};

    // Frontend ne match karta format ma response
    const lawyer = {
      id:             lawyerRaw.id,
      name:           lawyerRaw.name,
      email:          lawyerRaw.email,
      phone:          lawyerRaw.phone,
      address:        lawyerRaw.address,
      city:           lawyerRaw.city,
      state:          lawyerRaw.state,
      profileImage:   null,                            // schema ma image field nathi
      role:           lawyerRaw.role,
      status:         lawyerRaw.status,
      isVerified:     lawyerRaw.isVerified,
      // professionalDetails JSON mathi
      specialization: pd.specialization || null,
      experience:     pd.experience     || null,
      barCouncilId:   pd.barCouncilId   || pd.licenseNumber || null,
      about:          pd.about          || pd.bio           || null,
      rating:         pd.rating         || null,
      totalReviews:   pd.totalReviews   || 0,
      casesHandled:   pd.casesHandled   || null,
      successRate:    pd.successRate    || null,
      availability:   pd.availability   || {},
      education:      pd.education      || [],
      certifications: pd.certifications || [],
      reviews:        pd.reviews        || [],
      fees:           pd.fees           || null,
      // services: schema 'name' → frontend 'serviceName' transform
      services: lawyerRaw.legalServices.map(s => ({
        id:          s.id,
        serviceName: s.name,
        description: s.description,
        price:       s.price,
      }))
    };

    res.json({ success: true, lawyer });
  } catch (error) {
    console.error('getLawyerProfile error:', error);
    res.status(500).json({ error: 'Lawyer profile fetch karva ma error' });
  }
};

// ✅ PUT - User approve karo (BROKER/LAWYER)
const approveUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE', isVerified: true },
      select: { id: true, name: true, email: true, role: true, status: true }
    });

    res.json({ success: true, message: `${user.name} ne approve kari didho!`, user });
  } catch (error) {
    console.error('approveUser error:', error);
    res.status(500).json({ error: 'User approve karva ma error' });
  }
};

// ✅ PUT - User reject karo
const rejectUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.update({
      where: { id },
      data: { status: 'REJECTED' },
      select: { id: true, name: true, email: true, role: true, status: true }
    });

    res.json({ success: true, message: `${user.name} ne reject kari didho!`, user });
  } catch (error) {
    console.error('rejectUser error:', error);
    res.status(500).json({ error: 'User reject karva ma error' });
  }
};

// ✅ PUT - User update karo
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, role, status } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { name, phone, role, status },
      select: { id: true, name: true, email: true, role: true, status: true }
    });

    res.json({ success: true, message: 'User update thayo!', user });
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ error: 'User update karva ma error' });
  }
};

// ✅ DELETE - User delete karo
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({ where: { id } });

    res.json({ success: true, message: 'User delete thayo!' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ error: 'User delete karva ma error' });
  }
};

module.exports = {
  getAllUsers,
  getPendingUsers,
  getUserById,
  getLawyerProfile,
  approveUser,
  rejectUser,
  updateUser,
  deleteUser
};