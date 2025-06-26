# 🤝 Contributing to Navigate LA 28

Thank you for your interest in contributing to Navigate LA 28! This guide will help you get started with contributing to our geospatial navigation platform for the 2028 Los Angeles Olympics.

---

## 📋 **Table of Contents**

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [Development Setup](#-development-setup)
- [Contributing Guidelines](#-contributing-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Coding Standards](#-coding-standards)
- [Issue Guidelines](#-issue-guidelines)
- [Community](#-community)

---

## 🤝 **Code of Conduct**

### **Our Pledge**
We are committed to providing a welcoming and inspiring community for all. By participating in this project, you agree to abide by our Code of Conduct.

### **Expected Behavior**
- **Be respectful** and inclusive in language and actions
- **Be collaborative** and constructive in discussions
- **Be patient** with newcomers and help them learn
- **Give credit** where credit is due
- **Focus on what's best** for the community and project

### **Unacceptable Behavior**
- Harassment, discrimination, or inappropriate conduct
- Trolling, insulting comments, or personal attacks
- Publishing private information without permission
- Spamming or off-topic discussions

---

## 🚀 **Getting Started**

### **Ways to Contribute**
| Contribution Type | Skills Needed | Time Commitment |
|-------------------|---------------|-----------------|
| **Bug Reports** | Basic testing | 15-30 minutes |
| **Feature Requests** | Domain knowledge | 30 minutes |
| **Documentation** | Writing skills | 1-3 hours |
| **Code Contributions** | Programming | 2-8 hours |
| **UI/UX Improvements** | Design skills | 2-6 hours |
| **Testing** | QA experience | 1-4 hours |

### **First-Time Contributors**
Look for issues labeled with:
- 🟢 `good first issue` - Perfect for newcomers
- 🔧 `help wanted` - We need assistance with these
- 📚 `documentation` - Documentation improvements needed
- 🐛 `bug` - Bug fixes (check difficulty level)

---

## 💻 **Development Setup**

### **Prerequisites**
```bash
# Required software
Docker Desktop >= 20.10
Node.js >= 18.x
Python >= 3.10
Git >= 2.30
```

### **Quick Setup**
```bash
# 1. Fork and clone the repository
git clone https://github.com/your-username/Navigate-LA-28.git
cd Navigate-LA-28

# 2. Set up development environment
./scripts/setup-dev.sh

# 3. Start development servers
docker-compose up -d

# 4. Verify setup
npm run test:quick
pytest tests/unit/ -v
```

### **Development Workflow**
```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes and test
npm run test
pytest

# 3. Commit changes
git add .
git commit -m "feat: add your feature description"

# 4. Push and create PR
git push origin feature/your-feature-name
```

---

## 📝 **Contributing Guidelines**

### **Before You Start**
1. **Check existing issues** - Someone might already be working on it
2. **Discuss major changes** - Create an issue for significant features
3. **Follow coding standards** - Review our style guide
4. **Write tests** - Ensure your code is well-tested

### **Contribution Types**

#### **🐛 Bug Fixes**
```markdown
## Bug Fix Checklist
- [ ] Reproduce the bug reliably
- [ ] Identify root cause
- [ ] Write test to prevent regression
- [ ] Fix the issue with minimal changes
- [ ] Verify fix works in all environments
- [ ] Update documentation if needed
```

#### **✨ New Features**
```markdown
## Feature Checklist
- [ ] Create feature proposal issue
- [ ] Get approval from maintainers
- [ ] Design API/UI changes
- [ ] Implement with comprehensive tests
- [ ] Update documentation
- [ ] Consider backward compatibility
```

#### **📚 Documentation**
```markdown
## Documentation Checklist
- [ ] Ensure accuracy and clarity
- [ ] Include code examples where helpful
- [ ] Follow markdown style guide
- [ ] Test all code examples
- [ ] Check for broken links
- [ ] Update table of contents if needed
```

---

## 🔀 **Pull Request Process**

### **PR Requirements**
| Requirement | Description | Status |
|-------------|-------------|--------|
| **Tests** | All new code must have tests | ✅ Required |
| **Documentation** | Update docs for user-facing changes | ✅ Required |
| **Linting** | Code must pass all linters | ✅ Required |
| **Review** | At least one approval from maintainer | ✅ Required |
| **CI/CD** | All automated checks must pass | ✅ Required |

### **PR Template**
```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix/feature affecting existing functionality)
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Browser testing (for frontend changes)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No merge conflicts
```

### **Review Process**
1. **Automated Checks** - CI/CD pipeline runs
2. **Code Review** - Maintainer reviews code quality
3. **Testing Review** - Verify test coverage and quality
4. **Documentation Review** - Check docs are updated
5. **Approval** - Maintainer approves changes
6. **Merge** - Maintainer merges PR

---

## 📏 **Coding Standards**

### **Python (Backend)**
```python
# Use Black formatter with 88 character line length
# Use type hints for all functions
# Follow PEP 8 naming conventions

from typing import List, Optional
import logging

logger = logging.getLogger(__name__)

async def get_places_by_category(
    category: str,
    limit: int = 20,
    offset: int = 0
) -> List[Place]:
    """
    Retrieve places filtered by category.
    
    Args:
        category: Place category (restaurant, attraction, etc.)
        limit: Maximum number of results to return
        offset: Number of results to skip
        
    Returns:
        List of Place objects matching the category
        
    Raises:
        ValidationError: If category is invalid
    """
    if category not in VALID_CATEGORIES:
        raise ValidationError(f"Invalid category: {category}")
    
    try:
        places = await Place.find_by_category(category, limit, offset)
        logger.info(f"Retrieved {len(places)} places for category {category}")
        return places
    except Exception as e:
        logger.error(f"Failed to retrieve places: {e}")
        raise
```

### **TypeScript (Frontend)**
```typescript
// Use TypeScript for all new components
// Follow React best practices
// Use meaningful prop interfaces

interface PlaceCardProps {
  place: Place;
  onClick?: (place: Place) => void;
  showDistance?: boolean;
  className?: string;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onClick,
  showDistance = false,
  className = '',
}) => {
  const handleClick = useCallback(() => {
    onClick?.(place);
  }, [onClick, place]);

  return (
    <div
      className={`place-card ${className}`}
      onClick={handleClick}
      data-testid="place-card"
    >
      <h3 className="place-card__title">{place.name}</h3>
      <p className="place-card__description">{place.description}</p>
      {showDistance && place.distance && (
        <span className="place-card__distance">
          {formatDistance(place.distance)}
        </span>
      )}
    </div>
  );
};
```

### **Commit Message Format**
```bash
# Format: <type>(<scope>): <description>

# Types:
feat        # New feature
fix         # Bug fix
docs        # Documentation changes
style       # Code style (formatting, semicolons, etc.)
refactor    # Code refactoring
test        # Adding/updating tests
chore       # Maintenance tasks
perf        # Performance improvements
ci          # CI/CD changes

# Examples:
feat(search): add geospatial filtering to place search
fix(auth): resolve JWT token expiration handling
docs(api): update authentication endpoint documentation
test(places): add unit tests for place service
refactor(db): optimize database connection pooling
```

---

## 🐛 **Issue Guidelines**

### **Bug Reports**
```markdown
## Bug Report Template

**Description:**
Clear description of the bug

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior:**
What you expected to happen

**Screenshots:**
If applicable, add screenshots

**Environment:**
- OS: [e.g. macOS 12.0]
- Browser: [e.g. Chrome 96]
- Device: [e.g. iPhone 13]
- Version: [e.g. 1.0.0]

**Additional Context:**
Any other context about the problem
```

### **Feature Requests**
```markdown
## Feature Request Template

**Problem Statement:**
What problem does this feature solve?

**Proposed Solution:**
Describe your proposed solution

**Alternatives Considered:**
Other solutions you've considered

**User Stories:**
- As a [user type], I want [goal] so that [benefit]

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

**Additional Context:**
Screenshots, mockups, or examples
```

---

## 🏷️ **Issue Labels**

| Label | Description | Color |
|-------|-------------|-------|
| `bug` | Something isn't working | 🔴 Red |
| `enhancement` | New feature or request | 🟢 Green |
| `documentation` | Improvements to documentation | 🔵 Blue |
| `good first issue` | Good for newcomers | 🟡 Yellow |
| `help wanted` | Extra attention is needed | 🟠 Orange |
| `priority: high` | High priority issue | 🔴 Red |
| `priority: medium` | Medium priority issue | 🟡 Yellow |
| `priority: low` | Low priority issue | 🟢 Green |
| `frontend` | Frontend related | 🔵 Blue |
| `backend` | Backend related | 🟣 Purple |
| `security` | Security related | 🔴 Red |
| `performance` | Performance related | 🟠 Orange |

---

## 🌟 **Recognition**

### **Contributors**
We recognize all contributors in our:
- **README.md** - All contributors listed
- **CHANGELOG.md** - Release notes credit contributors
- **Monthly Newsletter** - Highlight community contributions
- **Social Media** - Celebrate major contributions

### **Contributor Levels**
- **🌱 New Contributor** - First PR merged
- **🔧 Regular Contributor** - 5+ PRs merged
- **⭐ Core Contributor** - 20+ PRs, regular involvement
- **🎯 Maintainer** - Project leadership, code ownership

---

## 💬 **Community**

### **Communication Channels**
- **GitHub Issues** - Bug reports, feature requests
- **GitHub Discussions** - General questions and ideas
- **Discord** - Real-time chat (link in README)
- **Email** - Direct contact: dev-team@navigate-la28.com

### **Meetings**
- **Weekly Standup** - Thursdays 10 AM PST
- **Monthly Planning** - First Monday of each month
- **Office Hours** - Fridays 2-4 PM PST for questions

### **Getting Help**
1. **Check Documentation** - README, API docs, guides
2. **Search Issues** - Your question might be answered
3. **Ask in Discussions** - For general questions
4. **Join Discord** - Real-time help from community
5. **Email Team** - For sensitive or complex issues

---

## 📄 **License**

By contributing to Navigate LA 28, you agree that your contributions will be licensed under the same [MIT License](../LICENSE) that covers the project.

---

## 🙏 **Thank You**

Thank you for contributing to Navigate LA 28! Your efforts help create a better experience for Olympic visitors and demonstrate the power of open-source collaboration. 

**Every contribution matters** - whether it's fixing a typo, reporting a bug, or adding a major feature. Together, we're building something amazing for the 2028 Los Angeles Olympics! 🏟️

---

*For questions about contributing, reach out to our team at dev-team@navigate-la28.com or join our Discord community.* 