"use strict";
// MailGuard Intelligence — Mock Email Forensics Service
// Analyzes supplied/demo email data only. No unauthorized access.
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeEmail = analyzeEmail;
function extractEmailsFromText(text) {
    const regex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    return [...new Set(text.match(regex) || [])];
}
function extractIPsFromText(text) {
    const regex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
    return [...new Set(text.match(regex) || [])];
}
function extractURLsFromText(text) {
    const regex = /https?:\/\/[^\s<>"]+/g;
    return [...new Set(text.match(regex) || [])];
}
function extractWalletsFromText(text) {
    const ethRegex = /0x[a-fA-F0-9]{40}/g;
    const btcRegex = /[13][a-km-zA-HJ-NP-Z1-9]{25,34}/g;
    return [...new Set([...(text.match(ethRegex) || []), ...(text.match(btcRegex) || [])])];
}
const suspiciousDomains = ['tempmail.com', 'guerrillamail.com', 'throwam.com', 'mailinator.com', 'trashmail.com'];
const suspiciousKeywords = ['urgent', 'wire transfer', 'bitcoin', 'cryptocurrency', 'click here', 'verify account', 'suspended', 'password reset', 'inheritance', 'lottery'];
async function analyzeEmail(content) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const lower = content.toLowerCase();
    const emails = extractEmailsFromText(content);
    const ips = extractIPsFromText(content);
    const urls = extractURLsFromText(content);
    const wallets = extractWalletsFromText(content);
    const senderMatch = content.match(/From:\s*([^\n<]+)?<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/i);
    const subjectMatch = content.match(/Subject:\s*([^\n]+)/i);
    const replyToMatch = content.match(/Reply-To:\s*([^\n<]+)?<?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/i);
    const senderEmail = senderMatch?.[2] || emails[0];
    const senderName = senderMatch?.[1]?.trim().replace(/"/g, '');
    const subject = subjectMatch?.[1]?.trim();
    const replyTo = replyToMatch?.[2];
    const recipients = emails.filter(e => e !== senderEmail).slice(0, 10);
    const extractedURLObjects = urls.map(url => {
        let domain = '';
        try {
            domain = new URL(url).hostname;
        }
        catch {
            domain = url.split('/')[0];
        }
        const isSuspicious = suspiciousDomains.some(d => domain.includes(d)) || domain.includes('bit.ly') || domain.includes('tinyurl');
        return { url, domain, isSuspicious, threat: isSuspicious ? 'Potentially malicious redirect' : undefined };
    });
    const extractedIPObjects = ips.map(ip => {
        const isPrivate = ip.startsWith('192.168') || ip.startsWith('10.') || ip.startsWith('172.');
        const isSuspicious = !isPrivate && Math.random() > 0.6;
        return {
            ip, isSuspicious,
            geolocation: isPrivate ? { type: 'private' } : {
                country: ['Russia', 'Nigeria', 'China', 'Romania', 'Brazil'][Math.floor(Math.random() * 5)],
                city: 'Unknown',
                lat: (Math.random() * 180 - 90).toFixed(4),
                lng: (Math.random() * 360 - 180).toFixed(4),
                isp: 'Unknown ISP',
            },
        };
    });
    const indicators = [];
    let threatScore = 0;
    const keywordsFound = suspiciousKeywords.filter(kw => lower.includes(kw));
    if (keywordsFound.length > 0) {
        threatScore += keywordsFound.length * 8;
        indicators.push({ name: 'Suspicious Keywords', description: `Found: ${keywordsFound.join(', ')}`, severity: 'HIGH' });
    }
    if (wallets.length > 0) {
        threatScore += 20;
        indicators.push({ name: 'Cryptocurrency Addresses', description: `${wallets.length} wallet address(es) found`, severity: 'HIGH' });
    }
    if (replyTo && replyTo !== senderEmail) {
        threatScore += 15;
        indicators.push({ name: 'Reply-To Mismatch', description: 'Reply-To differs from sender — possible phishing', severity: 'HIGH' });
    }
    if (extractedIPObjects.some(ip => ip.isSuspicious)) {
        threatScore += 20;
        indicators.push({ name: 'Suspicious IP Origin', description: 'Email originated from flagged geographic region', severity: 'MEDIUM' });
    }
    if (extractedURLObjects.some(u => u.isSuspicious)) {
        threatScore += 15;
        indicators.push({ name: 'Suspicious URLs', description: 'Email contains potentially malicious links', severity: 'HIGH' });
    }
    threatScore = Math.min(100, threatScore);
    const riskLevel = threatScore >= 70 ? 'HIGH' : threatScore >= 45 ? 'MEDIUM' : threatScore >= 20 ? 'LOW' : 'MINIMAL';
    const threatCategories = [];
    if (keywordsFound.includes('wire transfer') || keywordsFound.includes('urgent'))
        threatCategories.push('FINANCIAL_FRAUD');
    if (keywordsFound.includes('bitcoin') || keywordsFound.includes('cryptocurrency') || wallets.length > 0)
        threatCategories.push('CRYPTO_FRAUD');
    if (replyTo && replyTo !== senderEmail)
        threatCategories.push('PHISHING');
    if (extractedURLObjects.some(u => u.isSuspicious))
        threatCategories.push('MALICIOUS_LINK');
    if (threatCategories.length === 0)
        threatCategories.push('MONITORING');
    return {
        subject,
        senderEmail,
        senderName,
        recipientEmails: recipients,
        replyTo,
        extractedIPs: extractedIPObjects,
        extractedURLs: extractedURLObjects,
        extractedDomains: [...new Set(extractedURLObjects.map(u => u.domain).filter(Boolean))],
        extractedWallets: wallets,
        headers: { spf: 'neutral', dkim: 'unknown', dmarc: 'none', receivedFrom: ips[0] || 'unknown' },
        threatScore,
        riskLevel,
        threatCategories,
        indicators,
        spfStatus: Math.random() > 0.5 ? 'PASS' : 'FAIL',
        dkimStatus: Math.random() > 0.4 ? 'PASS' : 'FAIL',
        dmarcStatus: Math.random() > 0.6 ? 'PASS' : 'NONE',
        forensicSummary: `Email forensic analysis complete. Threat score: ${threatScore}/100 (${riskLevel}). ${indicators.length} indicator(s) identified. ${wallets.length} cryptocurrency address(es) extracted. ${extractedIPObjects.length} IP address(es) found. Human review ${threatScore > 50 ? 'strongly recommended' : 'advised'}.`,
        requiresHumanReview: true,
    };
}
//# sourceMappingURL=emailForensics.js.map