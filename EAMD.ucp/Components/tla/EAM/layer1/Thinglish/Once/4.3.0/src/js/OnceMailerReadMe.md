# Once Mailer documentation
OnceMailer is based on nodemailer so you can use all mail options you have with nodemailer

You easily can test functonality with the sendTestMail method. Important this testmail is not really sent. but you can access the mail with returned link.

If you update the ONCE Config with following parameters:
export ONCE_MAIL_HOST=smtp-mail.outlook.com
export ONCE_MAIL_USER=email@outlook.com
export ONCE_MAIL_PASSWORD=PASSWD
export ONCE_MAIL_PORT=587
export ONCE_MAIL_SECURE=false

you can use sendMail with only the message as parameter. How to define message you can see later in this document. very simple message is:

```
let message = {
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: "bar@example.com, baz@example.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
}
```

with the createTransport method you can create a custom transport configuration as you would do it in nodemailer

e.g. 
```
let transport = ONCE.mailer.createTransport({
    host: ONCE.ENV.ONCE_MAIL_HOST,
    port: Number.parseInt(ONCE.ENV.ONCE_MAIL_PORT),
    secure: ONCE.ENV.ONCE_MAIL_SECURE.toLowerCase() === 'true',
    auth: {
        user: ONCE.ENV.ONCE_MAIL_USER,
        pass: ONCE.ENV.ONCE_MAIL_PASSWORD,
    },
})
```

and then use this transporter for your mail
```
await ONCE.mailer.sendMail(message,transport) //use the created transport
await ONCE.mailer.sendMail(message) //use the transport out of ENV file
```

## Message configuration

The following are the possible fields of an email message:

### Common fields **

-   **from** - The email address of the sender. All email addresses can
    be plain *‘[sender@server.com](mailto:sender@server.com)’* or
    formatted *'“Sender Name”
    [sender@server.com](mailto:sender@server.com)'*, see [Address
    object](/message/addresses/) for details
-   **to** - Comma separated list or an array of recipients email
    addresses that will appear on the *To:* field
-   **cc** - Comma separated list or an array of recipients email
    addresses that will appear on the *Cc:* field
-   **bcc** - Comma separated list or an array of recipients email
    addresses that will appear on the *Bcc:* field
-   **subject** - The subject of the email
-   **text** - The plaintext version of the message as an Unicode
    string, Buffer, Stream or an attachment-like object (*{path:
    ‘/var/data/…'}*)
-   **html** - The HTML version of the message as an Unicode string,
    Buffer, Stream or an attachment-like object (*{path: ‘http://…'}*)
-   **attachments** - An array of attachment objects (see [Using
    attachments](/message/attachments/) for details). Attachments can be
    used for [embedding images](/message/embedded-images/) as well.

A large majority of emails sent look a lot like this, using only a few
basic fields:

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
var message = {
  from: "sender@server.com",
  to: "receiver@sender.com",
  subject: "Message title",
  text: "Plaintext version of the message",
  html: "<p>HTML version of the message</p>"
};
```

All text fields (email addresses, plaintext body, html body, attachment
filenames) use UTF-8 as the encoding. Attachments are streamed as
binary.

### More advanced fields **

##### Routing options **

-   **sender** - An email address that will appear on the *Sender:*
    field (always prefer *from* if you’re not sure which one to use)
-   **replyTo** - An email address that will appear on the *Reply-To:*
    field
-   **inReplyTo** - The Message-ID this message is replying to
-   **references** - Message-ID list (an array or space separated
    string)
-   **envelope** - optional SMTP envelope, if auto generated envelope is
    not suitable (see [SMTP envelope](/smtp/envelope/) for details)

##### Content options **

-   **attachDataUrls** – if true then convert *data:* images in the HTML
    content of this message to embedded attachments
-   **watchHtml** - Apple Watch specific HTML version of the message.
    Latest watches have no problems rendering text/html content so
    watchHtml is most probably never seen by the recipient
-   **amp** - AMP4EMAIL specific HTML version of the message, same usage
    as with `text` and `html`. See AMP example [below](#amp-example) for
    usage or [this
    blogpost](https://blog.nodemailer.com/2019/12/30/testing-amp4email-with-nodemailer/)
    for sending and rendering

When using \`amp\` then make sure it is a full and valid AMP4EMAIL
document, otherwise the displaying email client most probably falls back
to \`html\` and ignores the \`amp\` part. Validate your AMP4EMAIL
content [here](https://validator.ampproject.org/\#htmlFormat=AMP4EMAIL)

-   **icalEvent** – iCalendar event to use as an alternative. See
    details [here](/message/calendar-events/)
-   **alternatives** - An array of alternative text contents (in
    addition to text and html parts) (see [Using alternative
    content](/message/alternatives/) for details)
-   **encoding** - identifies encoding for text/html strings (defaults
    to ‘utf-8’, other values are ‘hex’ and ‘base64’)
-   **raw** - existing MIME message to use instead of generating a new
    one. See details [here](/message/custom-source/)
-   **textEncoding** - force content-transfer-encoding for text values
    (either *quoted-printable* or *base64*). By default the best option
    is detected (for lots of ascii use *quoted-printable*, otherwise
    *base64*)

##### Header options **

-   **priority** - Sets message importance headers, either **‘high’**,
    **‘normal’** (default) or **‘low’**.
-   **headers** - An object or array of additional header fields (e.g.
    *{“X-Key-Name”: “key value”}* or *[{key: “X-Key-Name”, value:
    “val1”}, {key: “X-Key-Name”, value: “val2”}]*). Read more about
    custom headers [here](/message/custom-headers/)
-   **messageId** - optional Message-Id value, random value will be
    generated if not set
-   **date** - optional Date value, current UTC string will be used if
    not set
-   **list** - helper for setting List-\* headers (see more
    [here](/message/list-headers/))

##### Security options **

-   **disableFileAccess** if true, then does not allow to use files as
    content. Use it when you want to use JSON data from untrusted source
    as the email. If an attachment or message node tries to fetch
    something from a file the sending returns an error. If this field is
    also set in the transport options, then the value in mail data is
    ignored
-   **disableUrlAccess** if true, then does not allow to use Urls as
    content. If this field is also set in the transport options, then
    the value in mail data is ignored

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
var message = {
    ...,
    headers: {
        'My-Custom-Header': 'header value'
    },
    date: new Date('2000-01-01 00:00:00')
};
```

\*\*Memory leak warning!\*\* When using readable streams as content and
sending fails then Nodemailer does not abort the already opened but not
yet finished stream, you need to do this yourself. Nodemailer only
closes the streams it has opened itself (eg. file paths, URLs)

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
var htmlstream = fs.createReadStream("content.html");
transport.sendMail({ html: htmlstream }, function(err) {
  if (err) {
    // check if htmlstream is still open and close it to clean up
  }
});
```

##### AMP example **

    let message = {
        from: 'Nodemailer <example@nodemailer.com>',
        to: 'Nodemailer <example@nodemailer.com>',
        subject: 'AMP4EMAIL message',
        text: 'For clients with plaintext support only',
        html: '<p>For clients that do not support AMP4EMAIL or amp content is not valid</p>',
        amp: `<!doctype html>
        <html ⚡4email>
          <head>
            <meta charset="utf-8">
            <style amp4email-boilerplate>body{visibility:hidden}</style>
            <script async src="https://cdn.ampproject.org/v0.js"></script>
            <script async custom-element="amp-anim" src="https://cdn.ampproject.org/v0/amp-anim-0.1.js"></script>
          </head>
          <body>
            <p>Image: <amp-img src="https://cldup.com/P0b1bUmEet.png" width="16" height="16"/></p>
            <p>GIF (requires "amp-anim" script in header):<br/>
              <amp-anim src="https://cldup.com/D72zpdwI-i.gif" width="500" height="350"/></p>
          </body>
        </html>`
    }

## Attachments

**attachments** option in the message object that contains an array of
attachment objects.

Attachment object consists of the following properties:

-   **filename** - filename to be reported as the name of the attached
    file. Use of unicode is allowed.
-   **content** - String, Buffer or a Stream contents for the attachment
-   **path** - path to the file if you want to stream the file instead
    of including it (better for larger attachments)
-   **href** – an URL to the file (data uris are allowed as well)
-   **httpHeaders** - optional HTTP headers to pass on with the *href*
    request, eg. `{authorization: "bearer ..."}`
-   **contentType** - optional content type for the attachment, if not
    set will be derived from the *filename* property
-   **contentDisposition** - optional content disposition type for the
    attachment, defaults to ‘attachment’
-   **cid** - optional content id for using inline images in HTML
    message source
-   **encoding** - If set and *content* is string, then encodes the
    content to a Buffer using the specified encoding. Example values:
    *‘base64’*, *‘hex’*, *‘binary’* etc. Useful if you want to use
    binary attachments in a JSON formatted email object.
-   **headers** - custom headers for the attachment node. Same usage as
    with message headers
-   **raw** - is an optional special value that overrides entire
    contents of current mime node including mime headers. Useful if you
    want to prepare node contents yourself

Attachments can be added as many as you want.

**Example**

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
let message = {
    ...
    attachments: [
        {   // utf-8 string as an attachment
            filename: 'text1.txt',
            content: 'hello world!'
        },
        {   // binary buffer as an attachment
            filename: 'text2.txt',
            content: new Buffer('hello world!','utf-8')
        },
        {   // file on disk as an attachment
            filename: 'text3.txt',
            path: '/path/to/file.txt' // stream this file
        },
        {   // filename and content type is derived from path
            path: '/path/to/file.txt'
        },
        {   // stream as an attachment
            filename: 'text4.txt',
            content: fs.createReadStream('file.txt')
        },
        {   // define custom content type for the attachment
            filename: 'text.bin',
            content: 'hello world!',
            contentType: 'text/plain'
        },
        {   // use URL as an attachment
            filename: 'license.txt',
            path: 'https://raw.github.com/nodemailer/nodemailer/master/LICENSE'
        },
        {   // encoded string as an attachment
            filename: 'text1.txt',
            content: 'aGVsbG8gd29ybGQh',
            encoding: 'base64'
        },
        {   // data uri as an attachment
            path: 'data:text/plain;base64,aGVsbG8gd29ybGQ='
        },
        {
            // use pregenerated MIME node
            raw: 'Content-Type: text/plain\r\n' +
                 'Content-Disposition: attachment;\r\n' +
                 '\r\n' +
                 'Hello world!'
        }
    ]
}
```

## Alternatives

In addition to text and HTML, any kind of data can be inserted as an
alternative content of the main body - for example a word processing
document with the same text as in the HTML field. It is the job of the
email client to select and show the best fitting alternative to the
reader. Usually this field is used for calendar events and such.

If you want to use a calendar event as the alternative, the consider
using the \*\*icalEvent\*\* option instead. See details
[here](/message/calendar-events/).

Alternative objects use the same options as [attachment
objects](/attachments/). The difference between an attachment and an
alternative is the fact that attachments are placed into
*multipart/mixed* or *multipart/related* parts of the message white
alternatives are placed into *multipart/alternative* part.

**Usage example:**

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
let message = {
    ...
    html: '<b>Hello world!</b>',
    alternatives: [
        {
            contentType: 'text/x-web-markdown',
            content: '**Hello world!**'
        }
    ]
}
```

Alternatives can be added as many as you want.

## Address object

All email addresses can be **plain** email addresses

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
'foobar@example.com'
```

-   or with **formatted name** (includes unicode support)

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
'Ноде Майлер <foobar@example.com>'
```

Notice that all address fields (even \*from:\*) are comma separated
lists, so if you want to use a comma (or any other special symbol) in
the name part, make sure you enclose the name in double quotes like
this: \`'"Майлер, Ноде" '\`

-   or as an **address object** (in this case you do not need to worry
    about the formatting, no need to use quotes etc.)

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
{
    name: 'Майлер, Ноде',
    address: 'foobar@example.com'
}
```

All address fields accept values as a comma separated list of emails or
an array of emails or an array of comma separated list of emails or
address objects - use it as you like. Formatting can be mixed.

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
...,
to: 'foobar@example.com, "Ноде Майлер" <bar@example.com>, "Name, User" <baz@example.com>',
cc: [
    'foobar@example.com',
    '"Ноде Майлер" <bar@example.com>,
    "Name, User" <baz@example.com>'
],
bcc: [
    'foobar@example.com',
    {
        name: 'Майлер, Ноде',
        address: 'foobar@example.com'
    }
]
...
```

You can even use unicode domains, these are automatically converted to
punycode

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
'"Unicode Domain" <info@müriaad-polüteism.info>'
```


## Calendar events

Calendar events are tricky because different email clients handle these
differently. Nodemailer uses the same style as Gmail for attaching
calendar files which should ensure maximum compatibility. If you want to
attach a calendar event to your email then you can use the message
option **icalEvent**:

-   **icalEvent** – an object to define calendar event

    -   **method** – optional method, case insensitive, defaults to
        *‘publish’*. Other possible values would be *‘request’*,
        *‘reply’*, *‘cancel’* or any other valid calendar method listed
        in [RFC5546](https://tools.ietf.org/html/rfc5546#section-1.4).
        This should match the **METHOD:** value in calendar event file.
    -   **filename** – optional filename, defaults to *‘invite.ics’*
    -   **content** – is the event file, it can be a string, a buffer, a
        stream
    -   **path** – is an alternative for *content* to load the calendar
        data from a file
    -   **href** – is an alternative for *content* to load the calendar
        data from an URL
    -   **encoding** – defines optional *content* encoding, eg. ‘base64’
        or ‘hex’. This only applies if the *content* is a string. By
        default an unicode string is assumed.

You can use modules like
[ical-generator](https://www.npmjs.com/package/ical-generator) to
generate the actual calendar file content, Nodemailer acts as a
transport layer only and does not generate the event file structure.

In general it is not a good idea to add additional attachments to
calendar messages as it might mess up the behavior of some email
clients. Try to keep it only to \*\*text\*\*, \*\*html\*\* and
\*\*icalEvent\*\* without any additional \*\*alternatives\*\* or
\*\*attachments\*\*

Examples
========

1. Send a REQUEST event as a string ** {#1-send-a-request-event-as-a-string}
--------------------------------------

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
let content = 'BEGIN:VCALENDAR\r\nPRODID:-//ACME/DesktopCalendar//EN\r\nMETHOD:REQUEST\r\n...';

let message = {
    from: 'sender@example.com',
    to: 'recipient@example.com',
    subject: 'Appointment',
    text: 'Please see the attached appointment',
    icalEvent: {
        filename: 'invitation.ics',
        method: 'request',
        content: content
    }
};
```

2. Send a PUBLISH event from a file ** {#2-send-a-publish-event-from-a-file}
--------------------------------------

Event data is loaded from the provided file and attached to the message.

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
let message = {
    from: 'sender@example.com',
    to: 'recipient@example.com',
    subject: 'Appointment',
    text: 'Please see the attached appointment',
    icalEvent: {
        method: 'PUBLISH',
        path: '/path/to/file'
    }
};
```

3. Send a CANCEL event from an URL ** {#3-send-a-cancel-event-from-an-url}
-------------------------------------

Event data is downloaded from the provided URL and attached to the
message as regular calendar file.

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
let message = {
    from: 'sender@example.com',
    to: 'recipient@example.com',
    subject: 'Appointment',
    text: 'Please see the attached appointment',
    icalEvent: {
        method: 'CANCEL',
        href: 'http://www.example.com/events?event=123'
    }
};
```

## Embedded images

Attachments can be used as embedded images in the HTML body. To use this
feature, you need to set additional property of the attachment - **cid**
(unique identifier of the file) which is a reference to the attachment
file. The same **cid** value must be used as the image URL in HTML
(using **cid:** as the URL protocol, see example below).

\*\*NB!\*\* the cid value should be as unique as possible!

#### Example **

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
let message = {
    ...
    html: 'Embedded image: <img src="cid:unique@nodemailer.com"/>',
    attachments: [{
        filename: 'image.png',
        path: '/path/to/file',
        cid: 'unique@nodemailer.com' //same cid value as in the html img src
    }]
}
```
## List headers

Nodemailer includes a helper for setting more complex *List-\** headers
with ease. You can use this by providing message option **list**. It’s
an object where key names are converted into list headers. List key
*help* becomes *List-Help* header etc.

**General rules**

-   If the value is a string, it is treated as an URL
-   If you want to provide an optional comment, use *{url:‘url’,
    comment: ‘comment’}* object
-   If you want to have multiple header rows for the same *List-\** key,
    use an array as the value for this key
-   If you want to have multiple URLs for single *List-\** header row,
    use an array inside an array
-   *List-\** headers are treated as pregenerated values, this means
    that lines are not folded and strings are not encoded. Use only
    ascii characters and be prepared for longer header lines

### Examples **

#### 1. Setup different List-\* headers ** {#1-setup-different-list--headers}

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
let message = {
    from: 'sender@example.com',
    to: 'recipient@example.com',
    subject: 'List Message',
    text: 'I hope no-one unsubscribes from this list!',
    list: {
        // List-Help: <mailto:admin@example.com?subject=help>
        help: 'admin@example.com?subject=help',
        // List-Unsubscribe: <http://example.com> (Comment)
        unsubscribe: {
            url: 'http://example.com',
            comment: 'Comment'
        },
        // List-Subscribe: <mailto:admin@example.com?subject=subscribe>
        // List-Subscribe: <http://example.com> (Subscribe)
        subscribe: [
            'admin@example.com?subject=subscribe',
            {
                url: 'http://example.com',
                comment: 'Subscribe'
            }
        ],
        // List-Post: <http://example.com/post>, <mailto:admin@example.com?subject=post> (Post)
        post: [
            [
                'http://example.com/post',
                {
                    url: 'admin@example.com?subject=post',
                    comment: 'Post'
                }
            ]
        ]
    }
};
```
## Custom headers

Most messages do not need any kind of tampering with the headers. If you
do need to add custom headers either to the message or to an
attachment/alternative, you can add these values with the **headers**
option. Values are processed automatically, non-ascii strings are
encoded as mime-words and long lines are folded.

-   **headers** – is an object of key-value pairs, where key names are
    converted into message header keys

### Examples **

#### 1. Set custom headers ** {#1-set-custom-headers}

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
let message = {
    ...,
    headers: {
        'x-my-key': 'header value',
        'x-another-key': 'another value'
    }
}

// Becomes:
//   X-My-Key: header value
//   X-Another-Key: another value
```

#### 2. Multiple rows with the same key ** {#2-multiple-rows-with-the-same-key}

The same header key can be used multiple times if the header value is an
Array

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
let message = {
    ...,
    headers: {
        'x-my-key': [
            'value for row 1',
            'value for row 2',
            'value for row 3'
        ]
    }
}

// X-My-Key: value for row 1
// X-My-Key: value for row 2
// X-My-Key: value for row 3
```

#### 3. Prepared headers ** {#3-prepared-headers}

Normally all headers are encoded and folded to meet the requirement of
having plain-ASCII messages with lines no longer than 78 bytes.
Sometimes it is preferable to not modify header values and pass these as
provided. This can be achieved with the **prepared** option:

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
let message = {
    ...,
    headers: {
        'x-processed': 'a really long header or value with non-ascii characters 👮',
        'x-unprocessed': {
            prepared: true,
            value: 'a really long header or value with non-ascii characters 👮'
        }
    }
}

// X-Processed: a really long header or value with non-ascii characters
//  =?UTF-8?Q?=F0=9F=91=AE?=
// X-Unprocessed: a really long header or value with non-ascii characters ?
```

## Custom source

If you want to use your own custom generated RFC822 formatted message
source, instead of letting Nodemailer to generate it from the message
options, use option **raw**. This can be used both for the entire
message or alternatively per-attachment or per-alternative.

Don't forget to set the \*\*envelope\*\* option when using \*\*raw\*\*
as the message source

### Examples **

#### 1. Use string as a message body ** {#1-use-string-as-a-message-body}

This example loads the entire message source from a string value. You
don’t have to worry about proper newlines, these are handled by
Nodemailer.

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
let message = {
    envelope: {
        from: 'sender@example.com',
        to: ['recipient@example.com']
    },
    raw: `From: sender@example.com
To: recipient@example.com
Subject: test message

Hello world!`
};
```

#### 2. Set EML file as message body ** {#2-set-eml-file-as-message-body}

This example loads the entire message source from a file

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
let message = {
    envelope: {
        from: 'sender@example.com',
        to: ['recipient@example.com']
    },
    raw: {
        path: '/path/to/message.eml'
    }
};
```

#### 3. Set string as attachment body ** {#3-set-string-as-attachment-body}

When using **raw** for attachments then you need to provide all content
headers youself, Nodemailer does not process it in any way (besides
newline processing), it is inserted into the MIME tree as is.

``` {style="color:#f8f8f2;background-color:#272822;-moz-tab-size:4;-o-tab-size:4;tab-size:4"}
let message = {
    from: 'sender@example.com',
    to: 'recipient@example.com',
    subject: 'Custom attachment',
    attachments: [{
        raw: `Content-Type: text/plain
Content-Disposition: attachment

Attached text file`}]
};
```
