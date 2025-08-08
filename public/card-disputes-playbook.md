# Card Disputes Playbook

## Document Control
- **Document ID**: CDP-PLY-001
- **Version**: 3.1
- **Effective Date**: January 1, 2024
- **Review Date**: June 30, 2024
- **Document Owner**: Payment Operations Department
- **Approved By**: Chief Financial Officer
- **Last Updated**: December 15, 2023

## 1. Overview and Purpose

### 1.1 Purpose
This playbook provides comprehensive guidance for handling credit card disputes, chargebacks, and payment-related complaints to minimize financial loss and maintain customer relationships while ensuring compliance with card network regulations.

### 1.2 Scope
This playbook covers:
- Credit and debit card disputes
- Chargeback management
- Fraud-related payment issues
- Authorization disputes
- Processing error complaints
- Refund and return disputes

## 2. Card Dispute Fundamentals

### 2.1 Types of Card Disputes

#### 2.1.1 Fraud Disputes
- **Unauthorized transactions**: Customer denies making the transaction
- **Card theft**: Physical card stolen and used
- **Account takeover**: Online account compromised
- **Counterfeit card**: Fraudulent card creation and use

#### 2.1.2 Authorization Disputes
- **Declined transactions**: Valid transactions incorrectly declined
- **Duplicate charges**: Same transaction charged multiple times
- **Incorrect amounts**: Transaction amount differs from agreed price
- **Currency conversion**: Disputes over exchange rates or fees

#### 2.1.3 Processing Disputes
- **Technical errors**: System glitches causing incorrect charges
- **Merchant errors**: Wrong products, services, or amounts charged
- **Timing issues**: Charges appearing before delivery or authorization
- **Recurring billing**: Disputes over subscription or automatic payments

#### 2.1.4 Service Disputes
- **Non-receipt**: Goods or services not received
- **Defective products**: Items not as described or defective
- **Service quality**: Poor quality services or non-performance
- **Cancelled orders**: Charges for cancelled transactions

### 2.2 Chargeback Reason Codes

#### Visa Reason Codes
- **10.1**: EMV Liability Shift Counterfeit Fraud
- **10.2**: EMV Liability Shift Non-Counterfeit Fraud
- **10.3**: Other Fraud – Card Present Environment
- **10.4**: Other Fraud – Card Absent Environment
- **10.5**: Visa Fraud Monitoring Program
- **11.1**: Card Recovery Bulletin
- **11.2**: Declined Authorization
- **11.3**: No Authorization
- **12.1**: Late Presentment
- **12.2**: Incorrect Transaction Code
- **12.3**: Incorrect Currency
- **12.4**: Incorrect Account Number
- **12.5**: Incorrect Amount
- **12.6.1**: Duplicate Processing
- **12.6.2**: Paid by Other Means
- **12.7**: Invalid Data
- **13.1**: Merchandise/Services Not Received
- **13.2**: Cancelled Recurring Transaction
- **13.3**: Not as Described or Defective Merchandise
- **13.4**: Counterfeit Merchandise
- **13.5**: Misrepresentation
- **13.6**: Credit Not Processed
- **13.7**: Cancelled Merchandise/Services

#### Mastercard Reason Codes
- **4807**: Warning Bulletin File
- **4808**: Authorization-Related Chargeback
- **4812**: Account Number Not on File
- **4834**: Point-of-Interaction Error
- **4837**: No Cardholder Authorization
- **4840**: Fraudulent Processing of Transactions
- **4841**: Cancelled Recurring or Digital Goods Transactions
- **4842**: Late Presentment
- **4846**: Correct Transaction Currency Code Not Provided
- **4849**: Questionable Merchant Activity
- **4853**: Cardholder Dispute
- **4854**: Cardholder Dispute—Not Elsewhere Classified
- **4855**: Goods or Services Not Provided
- **4859**: Addendum, No-Show, or ATM Dispute
- **4860**: Credit Not Processed
- **4862**: Counterfeit Transaction
- **4863**: Cardholder Does Not Recognize
- **4870**: Chip Liability Shift
- **4871**: Chip/PIN Liability Shift

## 3. Dispute Handling Procedures

### 3.1 Initial Dispute Assessment

#### Step 1: Dispute Receipt (Within 2 hours)
1. **Acknowledge receipt** to customer immediately
2. **Assign reference number** for tracking
3. **Gather initial information**:
   - Transaction date and amount
   - Merchant information
   - Card details (last 4 digits only)
   - Dispute reason
   - Customer contact information
4. **Initial categorization** based on dispute type
5. **Set customer expectations** for timeline

#### Step 2: Documentation Review (Within 4 hours)
1. **Collect transaction details** from payment processor
2. **Review authorization logs** and processing records
3. **Check for duplicate disputes** or related issues
4. **Verify customer account status** and history
5. **Assess fraud indicators** using risk scoring

#### Step 3: Preliminary Investigation (Within 24 hours)
1. **Transaction validation**:
   - Verify transaction occurred as described
   - Check authorization codes and responses
   - Review merchant and processor records
2. **Risk assessment**:
   - Evaluate fraud likelihood
   - Check customer dispute history
   - Assess financial impact
3. **Initial determination**:
   - Valid dispute requiring investigation
   - Invalid dispute requiring explanation
   - Immediate resolution possible

### 3.2 Fraud Dispute Procedures

#### 3.2.1 Unauthorized Transaction Investigation

**Step 1: Immediate Actions (Within 1 hour)**
1. **Card security**:
   - Block compromised card immediately
   - Issue new card with expedited delivery
   - Reset online account credentials
2. **Transaction review**:
   - Identify all potentially fraudulent transactions
   - Check transaction patterns and locations
   - Review merchant categories and risk levels
3. **Customer notification**:
   - Confirm card blocking and replacement
   - Provide fraud protection guidance
   - Set expectations for investigation timeline

**Step 2: Investigation Process (1-5 business days)**
1. **Transaction analysis**:
   - Geographic and temporal analysis
   - Merchant verification and reputation check
   - Transaction authorization details review
2. **Evidence gathering**:
   - Security footage requests (if applicable)
   - Merchant transaction records
   - IP address and device fingerprinting
   - Customer alibi verification (if needed)
3. **Fraud scoring**:
   - Apply fraud detection algorithms
   - Cross-reference with known fraud patterns
   - Assess customer credibility and history

**Step 3: Resolution (Within 10 business days)**
1. **Provisional credit** (if regulation requires):
   - Issue temporary credit within required timeframe
   - Notify customer of provisional nature
   - Continue investigation in background
2. **Final determination**:
   - Fraud confirmed: Make credit permanent
   - Fraud not confirmed: Reverse provisional credit
   - Inconclusive: Apply regulatory guidelines
3. **Customer communication**:
   - Detailed explanation of findings
   - Final resolution confirmation
   - Fraud prevention education

#### 3.2.2 Card Theft Procedures

**Immediate Response (Within 30 minutes)**
1. **Emergency card blocking**
2. **Law enforcement notification** (if required)
3. **Fraud alert activation**
4. **Customer safety verification**

**Investigation Process (1-3 business days)**
1. **Police report verification**
2. **Theft date confirmation**
3. **Subsequent transaction review**
4. **Liability assessment per regulations**

### 3.3 Non-Fraud Dispute Procedures

#### 3.3.1 Authorization Disputes

**Declined Transaction Investigation**
1. **Authorization log review**:
   - Check decline reason codes
   - Verify merchant terminal configuration
   - Review customer account limits and status
2. **System analysis**:
   - Network connectivity issues
   - Processor system status at time of transaction
   - Authorization routing problems
3. **Resolution options**:
   - System error confirmed: Full resolution and apology
   - Merchant error: Facilitate resolution with merchant
   - Valid decline: Explain reason and provide alternatives

**Duplicate Charge Investigation**
1. **Transaction matching**:
   - Identify duplicate authorization codes
   - Check for reversal attempts
   - Verify merchant processing procedures
2. **Timeline analysis**:
   - Determine sequence of events
   - Identify root cause of duplication
   - Assess merchant responsibility
3. **Resolution process**:
   - Immediate refund for clear duplicates
   - Merchant coordination for complex cases
   - System improvements to prevent recurrence

#### 3.3.2 Service and Quality Disputes

**Non-Receipt of Goods/Services**
1. **Delivery verification**:
   - Track shipment status and delivery confirmation
   - Contact shipping carriers for detailed records
   - Verify delivery address accuracy
2. **Merchant communication**:
   - Request proof of delivery from merchant
   - Verify merchant fulfillment procedures
   - Assess merchant responsiveness and cooperation
3. **Resolution timeline**:
   - Day 1-3: Initial investigation and merchant contact
   - Day 4-7: Detailed investigation and evidence gathering
   - Day 8-10: Final determination and resolution

**Quality/Description Disputes**
1. **Evidence collection**:
   - Customer photos and documentation
   - Original product descriptions and advertisements
   - Merchant return and refund policies
2. **Merchant negotiation**:
   - Facilitate direct resolution between parties
   - Verify merchant quality standards
   - Assess reasonableness of customer expectations
3. **Mediation process**:
   - Present evidence to both parties
   - Facilitate compromise solutions
   - Apply industry standards and best practices

## 4. Chargeback Management

### 4.1 Chargeback Lifecycle

#### Phase 1: Chargeback Initiation
1. **Card network notification** received
2. **Automatic debit** from merchant account
3. **Case file creation** with all documentation
4. **Timeline calculation** for response deadline

#### Phase 2: Merchant Response
1. **Evidence compilation**:
   - Transaction authorization records
   - Proof of delivery or service completion
   - Customer communications
   - Refund and return policies
   - Any additional relevant documentation
2. **Representment preparation**:
   - Compelling evidence package creation
   - Response letter drafting
   - Timeline compliance verification
3. **Submission process**:
   - Documentation upload to card network
   - Response tracking and confirmation
   - Follow-up scheduling

#### Phase 3: Issuer Review
1. **Evidence evaluation** by card issuer
2. **Customer consultation** for additional information
3. **Final determination**:
   - Chargeback upheld: Merchant loses dispute
   - Chargeback reversed: Merchant wins dispute
   - Additional information requested

#### Phase 4: Final Resolution
1. **Fund settlement** based on final decision
2. **Case closure** and documentation archival
3. **Performance reporting** and analysis
4. **Process improvement** identification

### 4.2 Chargeback Prevention Strategies

#### 4.2.1 Transaction Processing Best Practices
1. **Clear authorization**:
   - Always obtain authorization for transactions
   - Use current authorization codes
   - Verify AVS and CVV responses
2. **Accurate processing**:
   - Process transactions promptly
   - Use correct transaction dates
   - Apply appropriate merchant category codes
3. **Customer communication**:
   - Clear billing descriptors
   - Transparent pricing and policies
   - Prompt customer service responses

#### 4.2.2 Documentation Standards
1. **Transaction records**:
   - Complete authorization logs
   - Customer signature or PIN verification
   - Delivery confirmations and tracking
2. **Customer interactions**:
   - Support ticket documentation
   - Email correspondence archives
   - Phone call recordings (where legal)
3. **Policy documentation**:
   - Terms and conditions acceptance
   - Privacy policy acknowledgment
   - Return and refund policy agreement

### 4.3 Response Strategies by Reason Code

#### Fraud-Related Chargebacks (10.x codes)
**Evidence Requirements:**
- Customer identity verification
- Delivery confirmation to verified address
- Customer communication history
- Previous successful transactions
- IP address and device information

**Response Strategy:**
- Emphasize customer recognition of transaction
- Demonstrate transaction authenticity
- Provide evidence of customer satisfaction
- Show pattern of legitimate usage

#### Authorization-Related Chargebacks (11.x codes)
**Evidence Requirements:**
- Authorization approval codes
- Transaction terminal logs
- Network response codes
- Timing of authorization request

**Response Strategy:**
- Demonstrate valid authorization obtained
- Show technical compliance with procedures
- Provide processor confirmation records
- Explain any authorization delays

#### Processing Error Chargebacks (12.x codes)
**Evidence Requirements:**
- Accurate transaction processing logs
- Currency conversion documentation
- Correct account number verification
- Proper transaction coding evidence

**Response Strategy:**
- Prove processing accuracy
- Demonstrate compliance with card network rules
- Provide detailed transaction records
- Show error prevention measures

#### Consumer Dispute Chargebacks (13.x codes)
**Evidence Requirements:**
- Proof of delivery or service completion
- Customer satisfaction evidence
- Return/refund policy compliance
- Quality assurance documentation

**Response Strategy:**
- Demonstrate service fulfillment
- Show customer acceptance and satisfaction
- Provide quality evidence
- Explain return policy compliance

## 5. Customer Communication

### 5.1 Communication Timeline

#### Initial Contact (Within 2 hours)
```
Subject: Card Dispute Received - Reference #[DISPUTE_ID]

Dear [Customer Name],

We have received your card dispute regarding the transaction on [Date] for $[Amount] at [Merchant]. Your dispute reference number is [DISPUTE_ID].

What happens next:
1. We will investigate your dispute within 10 business days
2. If eligible, provisional credit may be issued within 2 business days
3. You will receive updates every 48 hours during investigation
4. Final resolution will be communicated within 10 business days

Important: Please continue to monitor your account and report any additional unauthorized transactions immediately.

Best regards,
Card Dispute Team
Reference: [DISPUTE_ID]
```

#### Investigation Update (Every 48 hours)
```
Subject: Update on Your Card Dispute - Reference #[DISPUTE_ID]

Dear [Customer Name],

We wanted to provide you with an update on your card dispute investigation.

Current Status: [STATUS_DESCRIPTION]
Actions Taken: [INVESTIGATION_STEPS]
Next Steps: [UPCOMING_ACTIONS]
Expected Timeline: [ESTIMATED_COMPLETION]

If you have any additional information that might help with our investigation, please contact us at [CONTACT_INFO].

Best regards,
Card Dispute Team
Reference: [DISPUTE_ID]
```

#### Final Resolution (Within 10 business days)
```
Subject: Resolution of Your Card Dispute - Reference #[DISPUTE_ID]

Dear [Customer Name],

We have completed our investigation of your card dispute and reached a final resolution.

Dispute Details:
- Transaction Date: [DATE]
- Amount: $[AMOUNT]
- Merchant: [MERCHANT_NAME]

Investigation Findings:
[DETAILED_EXPLANATION_OF_FINDINGS]

Resolution:
[SPECIFIC_RESOLUTION_DETAILS]

[If credit issued]
A credit of $[AMOUNT] has been applied to your account and will appear within 1-2 business days.

[If dispute denied]
Based on our investigation, we were unable to process your dispute request. The transaction appears to be valid based on [SPECIFIC_REASONS].

Your Rights:
[INFORMATION_ABOUT_APPEAL_PROCESS_OR_REGULATORY_RIGHTS]

Best regards,
Card Dispute Team
Reference: [DISPUTE_ID]
```

### 5.2 Difficult Conversation Management

#### Angry or Frustrated Customers
1. **Active listening**: Allow customer to express frustration fully
2. **Empathy statements**: "I understand how frustrating this must be"
3. **Acknowledgment**: Recognize the impact on the customer
4. **Solution focus**: Redirect conversation to resolution steps
5. **Regular updates**: Provide frequent communication to reduce anxiety

#### Complex or High-Value Disputes
1. **Senior staff assignment**: Escalate to experienced investigators
2. **Enhanced communication**: Daily updates for high-value cases
3. **Management involvement**: Director-level oversight for complex cases
4. **Legal consultation**: Involve legal team for potential litigation
5. **Relationship management**: Consider customer value and relationship impact

## 6. Regulatory Compliance

### 6.1 Regulation E (Electronic Fund Transfers)

#### Liability Limits
- **Timely reporting** (within 2 business days): $50 maximum liability
- **Late reporting** (2-60 days): $500 maximum liability
- **Very late reporting** (after 60 days): Unlimited liability for unauthorized transfers after 60 days

#### Investigation Requirements
- **Provisional credit**: Must provide within 10 business days (or 20 for new accounts)
- **Investigation completion**: 10 business days for POS transactions, 45 days for other EFTs
- **Final determination**: Must notify customer of results within 3 business days of completion

#### Error Resolution
- **Notice requirement**: Customer must provide notice within 60 days
- **Investigation timeline**: 10 business days for most errors
- **Correction requirement**: Must correct errors within 1 business day of determination

### 6.2 Regulation Z (Credit Cards)

#### Billing Error Rights
- **Dispute timeline**: Customer has 60 days from statement date to dispute
- **Investigation period**: 30 days to acknowledge, 90 days to investigate
- **Provisional credit**: Not required for credit card disputes (unlike debit cards)

#### Fair Credit Billing Act
- **Written notice**: Customer disputes must be in writing
- **Amount threshold**: No minimum amount for disputes
- **Interest charges**: Cannot charge interest on disputed amounts during investigation

### 6.3 Card Network Rules

#### Visa Regulations
- **Chargeback timeframes**: Specific deadlines for each reason code
- **Evidence requirements**: Detailed documentation standards
- **Dispute limits**: Maximum number of disputes per customer
- **Merchant responsibilities**: Specific obligations for transaction processing

#### Mastercard Regulations
- **Arbitration process**: Final dispute resolution mechanism
- **Compliance monitoring**: Regular audits and performance reviews
- **Financial penalties**: Fines for excessive chargebacks or rule violations

## 7. Performance Metrics and KPIs

### 7.1 Key Performance Indicators

#### Efficiency Metrics
- **Initial Response Time**: Target <2 hours (Current: 1.8 hours)
- **Investigation Completion**: Target <10 business days (Current: 8.2 days)
- **Customer Communication**: Target every 48 hours (Current: 95% compliance)
- **Final Resolution**: Target <15 business days (Current: 12.1 days)

#### Quality Metrics
- **Customer Satisfaction**: Target >4.2/5.0 (Current: 4.4/5.0)
- **First-Call Resolution**: Target >60% (Current: 67%)
- **Appeal Rate**: Target <5% (Current: 3.8%)
- **Regulatory Compliance**: Target 100% (Current: 99.7%)

#### Financial Metrics
- **Chargeback Win Rate**: Target >65% (Current: 71%)
- **Fraud Detection Accuracy**: Target >95% (Current: 97.2%)
- **Recovery Rate**: Target >40% (Current: 43.5%)
- **Cost per Dispute**: Target <$85 (Current: $78)

### 7.2 Reporting and Analysis

#### Daily Reports
- Open dispute queue and aging
- SLA compliance tracking
- Escalation summary
- Customer satisfaction scores

#### Weekly Reports
- Dispute volume trends
- Chargeback performance analysis
- Fraud pattern identification
- Process improvement opportunities

#### Monthly Reports
- Comprehensive performance review
- Financial impact analysis
- Regulatory compliance status
- Benchmark comparisons

## 8. Training and Development

### 8.1 Initial Training Program (40 hours)

#### Week 1: Fundamentals (20 hours)
- **Card payment basics** (4 hours): How card transactions work
- **Dispute types and regulations** (8 hours): Legal requirements and types
- **Investigation procedures** (4 hours): Step-by-step processes
- **Documentation standards** (4 hours): Required evidence and records

#### Week 2: Advanced Skills (20 hours)
- **Fraud detection techniques** (6 hours): Pattern recognition and analysis
- **Customer communication** (6 hours): Difficult conversations and empathy
- **Chargeback management** (4 hours): Response strategies and evidence
- **System training** (4 hours): Technology platforms and tools

### 8.2 Ongoing Development

#### Monthly Training Sessions
- **Regulatory updates**: New rules and compliance requirements
- **Fraud trends**: Emerging fraud patterns and prevention
- **Best practices**: Sharing successful case studies
- **Technology updates**: New system features and improvements

#### Specialized Training
- **Senior investigator training**: Complex case management
- **Regulatory compliance**: Deep dive into legal requirements
- **Fraud investigation**: Advanced detection and analysis techniques
- **Customer relations**: Advanced communication and de-escalation

## 9. Technology and Tools

### 9.1 Dispute Management System

#### Core Features
- **Case management**: Complete dispute lifecycle tracking
- **Document management**: Evidence storage and organization
- **Workflow automation**: Automated routing and reminders
- **Reporting tools**: Real-time dashboards and analytics
- **Integration capabilities**: Connection to payment processors and card networks

#### User Access Levels
- **Agent level**: Case creation, investigation, customer communication
- **Supervisor level**: Case oversight, quality review, escalation management
- **Manager level**: Performance monitoring, reporting, process management
- **Admin level**: System configuration, user management, compliance oversight

### 9.2 Fraud Detection Tools

#### Real-Time Monitoring
- **Transaction scoring**: Risk assessment for each transaction
- **Pattern detection**: Identification of suspicious activities
- **Geographic analysis**: Location-based risk assessment
- **Velocity checking**: Rapid transaction frequency monitoring

#### Investigation Tools
- **Device fingerprinting**: Unique device identification
- **IP geolocation**: Transaction location verification
- **Behavioral analysis**: Customer spending pattern analysis
- **Database cross-referencing**: Known fraud pattern matching

### 9.3 Communication Platforms

#### Customer Communication
- **Email automation**: Template-based communication
- **SMS notifications**: Critical update alerts
- **Secure messaging**: Protected customer communication portal
- **Video calling**: Face-to-face support for complex cases

#### Internal Communication
- **Case collaboration**: Team-based investigation tools
- **Knowledge sharing**: Best practice and precedent databases
- **Escalation management**: Automated supervisor notifications
- **Training platforms**: Online learning and certification systems

## 10. Appendices

### Appendix A: Quick Reference Guide
### Appendix B: Reason Code Definitions
### Appendix C: Regulatory Requirements Summary
### Appendix D: Evidence Collection Checklists
### Appendix E: Communication Templates
### Appendix F: Escalation Procedures
### Appendix G: Performance Dashboards
### Appendix H: Training Materials

---

**Document Approval:**

**Prepared by:** Payment Operations Team  
**Reviewed by:** Legal and Compliance Departments  
**Approved by:** Chief Financial Officer  
**Date:** December 15, 2023

*This playbook is updated quarterly to reflect changes in regulations, card network rules, and industry best practices.* 