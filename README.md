FOLDER STRUCTURE:

TVMEMS-UI/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── ...other core services
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── ...other guards
│   │   │   ├── interceptors/
│   │   │   │   ├── ...http interceptors
│   │   │   ├── core.module.ts
│   │   │   └── index.ts
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── loader/
│   │   │   │   │   ├── loader.component.ts
│   │   │   │   │   ├── loader.component.html
│   │   │   │   │   ├── loader.component.css
│   │   │   │   ├── ...other shared components
│   │   │   ├── pipes/
│   │   │   │   ├── ...custom pipes
│   │   │   ├── directives/
│   │   │   │   ├── ...custom directives
│   │   │   ├── shared.module.ts
│   │   │   └── index.ts
│   │   ├── features/
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   ├── login.component.css
│   │   │   │   ├── login.module.ts
│   │   │   ├── login/
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   ├── login.component.css
│   │   │   │   ├── login.module.ts
│   │   │   ├── mainlayout/
│   │   │   │   ├── mainlayout.component.ts
│   │   │   │   ├── mainlayout.component.html
│   │   │   │   ├── mainlayout.component.css
│   │   │   │   ├── timelog/
│   │   │   │   │   ├── timelog.component.ts
│   │   │   │   │   ├── timelog.component.html
│   │   │   │   │   ├── timelog.component.css
│   │   │   │   ├── Onboarding/
│   │   │   │   │   ├── Onboarding.component.ts
│   │   │   │   │   ├── Onboarding.component.html
│   │   │   │   │   ├── Onboarding.component.css
│   │   │   │   ├── Offboarding/
│   │   │   │   │   ├── Offboarding.component.ts
│   │   │   │   │   ├── Offboarding.component.html
│   │   │   │   │   ├── Offboarding.component.css
│   │   │   │   ├── Aside/
│   │   │   │   │   ├── Offboarding.component.ts
│   │   │   │   │   ├── Offboarding.component.html
│   │   │   │   │   ├── Offboarding.component.css
│   │   │   │   ├── ...other mainlayout children
│   │   │   ├── AdminLogin/
│   │   │   │   ├── AdminLogin.component.ts
│   │   │   │   ├── AdminLogin.component.html
│   │   │   │   ├── AdminLogin.component.css
│   │   │   │   ├── AdminLogin.module.ts
│   │   │   ├── LoginByNumber/
│   │   │   │   ├── LoginByNumber.component.ts
│   │   │   │   ├── LoginByNumber.component.html
│   │   │   │   ├── LoginByNumber.component.css
│   │   │   │   ├── LoginByNumber.module.ts
│   │   │   ├── ...other features
│   │   ├── models/
│   │   │   ├── user.model.ts
│   │   │   ├── ...other models
│   │   ├── app-routing.module.ts
│   │   ├── app.module.ts
│   ├── assets/
│   │   ├── images/
│   │   │   ├── TVM Infotech Logo.jpg
│   │   │   ├── profile.jpg
│   │   │   ├── ...other images
│   │   ├── ...other assets
│   ├── environments/
│   │   ├── environment.ts
│   │   ├── environment.prod.ts
│   ├── styles.css
│   ├── index.html
│   ├── main.ts
│   ├── ...other config files
├── angular.json
├── package.json
├── ...other root files
